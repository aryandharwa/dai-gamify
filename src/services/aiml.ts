import OpenAI from 'openai';
import { GameTimePlayed } from '../types/index';
import {
  EAS,
  SchemaEncoder,
  NO_EXPIRATION,
  SchemaRegistry
} from "@ethereum-attestation-service/eas-sdk";
import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";
import { ethers } from "ethers";

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // Base Sepolia v0.26
const schemaRegistryContractAddress =
  "0x4200000000000000000000000000000000000020";
const schemaUID = import.meta.env.VITE_EAS_SCHEMA_ID;

// Function to calculate the player's reputation score
export async function calculateReputationScore(games: GameTimePlayed[]): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const ADMIN_PRIVATE_KEY = process.env.NEXT_PUBLIC_ADMIN_PRIVATE_KEY_ZG!;
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    const broker = await createZGServingNetworkBroker(adminWallet);

    // List available services
    console.log("Listing available services...");
    const services = await broker.listService();
    services.forEach((service: any) => {
      console.log(
        `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}, Model: ${service.model}, URL: ${service.url}`
      );
    });

    // Select the desired service
    const serviceName = "YourServiceName"; // Replace with the actual service name
    const service = services.find((s: any) => s.name === serviceName);
    if (!service) {
      console.error("Service not found.");
      return 0;
    }

    const providerAddress = service.provider;

    // Fund the account for using the service
    const initialBalance = 0.00000001;
    await broker.addAccount(providerAddress, initialBalance);

    const depositAmount = 0.00000002;
    console.log("Depositing funds...");
    await broker.depositFund(providerAddress, depositAmount);
    console.log("Funds deposited successfully.");

    // Fetch metadata for the service
    const { endpoint, model } = await broker.getServiceMetadata(providerAddress, serviceName);

    // Prepare request headers
    const content = `Analyze these game statistics and provide the player's reputation score as a single two-digit number: ${JSON.stringify(games)}`;
    const headers = await broker.getRequestHeaders(providerAddress, serviceName, content);

    // Send the request using the fetched metadata and headers
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        messages: [{ role: "system", content }],
        model: model,
      }),
    });

    if (!response.ok) {
      console.error("Error in AI service request:", response.statusText);
      return 0;
    }

    const result = await response.json();
    const receivedContent = result.choices?.[0]?.message?.content || '';
    console.log("Response Content:", receivedContent);

    // Process the response
    const chatID = result.id;
    const isValid = await broker.processResponse(providerAddress, serviceName, receivedContent, chatID);
    console.log(`Response validity: ${isValid ? "Valid" : "Invalid"}`);

    const scoreMatch = receivedContent.match(/\b\d{1,3}\b/);
    const score = scoreMatch ? parseInt(scoreMatch[0], 10) : 0;
    return Math.min(Math.max(score, 0), 100);

  } catch (error) {
    console.error("Error calculating reputation score:", error);
    return 0;
  }
}



// Function to attest data with EAS
export async function attestData(score: number) {
  // Connect to a provider (e.g., Alchemy, Infura, or MetaMask)
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const eas = new EAS(EASContractAddress);
  eas.connect(signer);

  try {

    const schemaEncoder = new SchemaEncoder("uint256 score, address player");
    const encodedData = schemaEncoder.encodeData([
      { name: "score", value: score, type: "uint256" },
      { name: "player", value: signer.address, type: "address" },
    ]);

    const transaction = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: signer.address,
        expirationTime: NO_EXPIRATION,
        revocable: false,
        data: encodedData,
      },
    });

    const attestationUID = await transaction.wait();
    console.log("New attestation UID:", attestationUID);
    console.log("Transaction receipt:", transaction.receipt);
    return attestationUID;
  } catch (error: any) {
    console.error('Error attesting data:', error.message || error);
  }
}

// Main function to calculate score and attest
export async function attestWithAI(games: GameTimePlayed[]) {

  // const call = await WalletCall();
  // console.log(call);

  // GetAttestations();

  const score = await calculateReputationScore(games);
  console.log("Calculated score:", score);
  const uid = await attestData(score);

  if (uid) {
    console.log("Attestation UID:", uid);
    const finalTrustScore = await getAttestationsOfPlayers(uid);
    return finalTrustScore;
  } else {
    console.error("Failed to fetch UID after attestation.");
  }

}

export async function decodeData(abiTypes: any, raw_data: any) {
  const coder = new AbiCoder();
  const bytes = getBytes(raw_data);
  console.log("bytes is", bytes);
  const decodedResult = coder.decode(
    abiTypes.map((item: any) => item.type),
    bytes
  );

  const formattedResult = abiTypes.reduce((acc: any, { name }, index: any) => {
    acc[name] = decodedResult[index];
    if (typeof acc[name] === "bigint") {
      acc[name] = acc[name].toString();
    } else if (acc[name] instanceof Uint8Array) {
      acc[name] = ethers.hexlify(acc[name]);
    } else if (Array.isArray(acc[name])) {
      acc[name] = acc[name].map((subItem: any) =>
        typeof subItem === "bigint" ? subItem.toString() : subItem
      );
    } else {
      acc[name] = acc[name].toString();
    }
    return acc;
  }, {});

  console.log("Decoded Data:", formattedResult);
  return formattedResult;
}

const saveJSON = (data: any) => {
  fetch("http://localhost:3001/save-json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((text) => {
      console.log(text);
    })
    .catch((error) => {
      console.error("Error saving JSON data:", error);
    });
};

// Fetch attestation and decode its data
export async function getAttestationsOfPlayers(uid: any) {
  const EASContractAddress = "0x4200000000000000000000000000000000000021"; // Base Sepolia v0.26
  const provider = ethers.getDefaultProvider(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL);
  const eas = new EAS(EASContractAddress);

  eas.connect(provider);

  // Fetch attestation using the UID
  const attestation = await eas.getAttestation(uid);
  console.log(attestation);

  const attest_data = attestation.data;

  const schemaRecord = await fetchSchemaRecord(provider, schemaUID);
  console.log("schema is lavda", schemaRecord);
  const abiTypes = parseSchema(schemaRecord);
  console.log("yeh hai abiiii", abiTypes)
  const decodedData = await decodeData(abiTypes, attest_data);
  console.log("hemlo", decodedData)

  const player = decodedData.player;
  const score = decodedData.score;

  console.log(player, score);

  // Pass decoded data to the trust calculation function
  const playerScore = calculateTrustScore(player, score);

  return playerScore;
}

// Calculate transitive trust
export async function calculateTrustScore(userId: string, score: number) {
  const graph = new TransitiveTrustGraph();

  const decimalScore = score / 100;

  // Add an edge to the graph between AI and the player
  graph.addEdge("AI", userId, decimalScore, 0);

  // Compute trust scores between AI and the player
  const scores = graph.computeTrustScores("AI", [userId]);

  console.log("Transitive Trust Score:");
  console.log(scores);

  const playerTrustScore = scores[userId];
  const trustScore = playerTrustScore ? playerTrustScore.netScore : undefined;
  const percentTrustScore = trustScore * 100;
  console.log(percentTrustScore);

  return percentTrustScore;

  // Example Output: { player_address: { positiveScore: X, negativeScore: Y, netScore: Z } }
}