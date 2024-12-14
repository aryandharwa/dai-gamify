import OpenAI from 'openai';
import { GameTimePlayed } from '../types/index';
import {
  EAS,
  SchemaEncoder,
  NO_EXPIRATION,
  SchemaRegistry
} from "@ethereum-attestation-service/eas-sdk";
import { TransitiveTrustGraph } from "@ethereum-attestation-service/transitive-trust-sdk";
import { ethers, AbiCoder, getBytes } from "ethers";
import GetAttestations from './transitiveTrust';
import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";
// import { WalletInteraction } from './mcpWallet'; 
// import { WalletCall } from './mcpWallet';


export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // Base Sepolia v0.26
const schemaRegistryContractAddress =
  "0x4200000000000000000000000000000000000020";
const schemaUID = import.meta.env.VITE_EAS_SCHEMA_ID;

const api = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_KEY,
  baseURL: 'https://models.inference.ai.azure.com',
  dangerouslyAllowBrowser: true,
});

export const fetchSchemaRecord = async (provider: any, attestation_data: any) => {
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);
  await schemaRegistry.connect(provider);

  const schemaRecord = await schemaRegistry.getSchema({ uid: attestation_data });
  console.log(schemaRecord);
  return schemaRecord[3]
};

function parseSchema(schemaRecord: any) {
  const parts = schemaRecord.split(",").map((part: any) => part.trim());
  const abiTypes = parts.map((part: any) => {
    const [type, name] = part.split(" ").map((p: any) => p.trim());
    return { type, name };
  });
  console.log("abi", abiTypes);
  return abiTypes;
}

// Function to calculate the player's reputation score
export async function calculateReputationScore(games: GameTimePlayed[]): Promise<number> {

  try {

    const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
    const signer = await provider.getSigner();
    const broker = await createZGServingNetworkBroker(signer);

    // Step 3: List available services
    console.log("Listing available services...");
    const services = await broker.listService();
    services.forEach((service: any) => {
      console.log(
        `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}, Model: ${service.model}, URL: ${service.url}`
      );
    });

    // Step 3.1: Select a service
    const service = services.find(
      (service: any) => service.name === "Please input the service name"
    );
    if (!service) {
      console.error("Service not found.");
      return;
    }
    const providerAddress = service.provider;


    // Step 4: Manage Accounts
    const initialBalance = 0.00000001;
    // Step 4.1: Create a new account
    console.log("Creating a new account...");
    await broker.addAccount(providerAddress, initialBalance);
    console.log("Account created successfully.");

    // Step 4.2: Deposit funds into the account
    const depositAmount = 0.00000002;
    console.log("Depositing funds...");
    await broker.depositFund(providerAddress, depositAmount);
    console.log("Funds deposited successfully.");

    // Step 4.3: Get the account
    const account = await broker.getAccount(providerAddress);
    console.log(account);

    // Step 5: Use the Provider's Services
    console.log("Processing a request...");
    const serviceName = service.name;
    const content = "Please input your message here";

    // Step 5.1: Get the request metadata
    const { endpoint, model } = await broker.getServiceMetadata(
      providerAddress,
      serviceName
    );

    // Step 5.2: Get the request headers
    const headers = await broker.getRequestHeaders(
      providerAddress,
      serviceName,
      content
    );

    // Step 6: Send a request to the service
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "",
    });
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "system", content }],
        model: model,
      },
      {
        headers: {
          ...headers,
        },
      }
    );

    const receivedContent = completion.choices[0].message.content;
    const chatID = completion.id;
    if (!receivedContent) {
      throw new Error("No content received.");
    }
    console.log("Response:", receivedContent);

    // Step 7: Process the response
    console.log("Processing a response...");
    const isValid = await broker.processResponse(
      providerAddress,
      serviceName,
      receivedContent,
      chatID
    );
    console.log(`Response validity: ${isValid ? "Valid" : "Invalid"}`);
  } catch (error) {
    console.error("Error during execution:", error);
  }

  if (!Array.isArray(games) || games.length === 0) {
    console.warn('No games provided, returning default score.');
    return 0;
  }

  const gamesData = games.map(game => ({
    name: game.name || 'Unknown',
    timePlayed: game.timePlayed || 0,
  }));

  const completion = await api.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a gaming reputation analyzer. Based on the player\'s game statistics, calculate their reputation score fairly, considering factors like time played, calculate all the time played (cumulative of all games) and number of games played. Calculate soes the data looks like it is from a human, give more score if data looks human, if data looks like generated by a bot then give less points. Output only the reputation score as a two-digit number (0-100), without any explanation or additional text.'
      },
      {
        role: 'user',
        content: `Analyze these game statistics and provide the player's reputation score as a single two-digit number: ${JSON.stringify(gamesData)}`
      }
    ],
    temperature: 0.7,
    max_tokens: 5,
  });

  const responseContent = completion.choices?.[0]?.message?.content || '';
  const scoreMatch = responseContent.match(/\b\d{1,3}\b/);
  const score = scoreMatch ? parseInt(scoreMatch[0], 10) : 0;

  return Math.min(Math.max(score, 0), 100);
} catch (error: any) {
  console.error('Error calculating reputation score:', error.message || error);
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