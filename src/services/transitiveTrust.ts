import { TransitiveTrustGraph } from "@ethereum-attestation-service/transitive-trust-sdk";
import { gql } from '@apollo/client';
import client from "./apolloClient.js"; // Ensure this is correctly configured
import { decodeData } from "./aiml"; // Ensure this is correctly implemented
import { ethers } from "ethers"

// GraphQL query to fetch attestations
export const GET_ATTESTATIONS = gql`
  query Query($where: AttestationWhereInput) {
    attestations(where: $where) {
      id
      data
    }
  }
`;

// Function to fetch attestations from the GraphQL endpoint
export const getAttestationsData = async () => {
  try {
    const { data } = await client.query({
      query: GET_ATTESTATIONS,
      variables: {
        where: {
          schemaId: {
            equals: "0x25de8589e4a501a40dd0ab0adf6b6c9f492027f5820136ac1da1ffd248dec04e",
          },
        },
      },
    });
    console.log("Fetched attestations:", data);
    return data.attestations;
  } catch (error) {
    console.error("Error fetching attestations:", error);
    throw error;
  }
};

// Function to decode attestation data into scores
export async function DataToScore(attestData: any) {
  const abiTypes = [
    { type: "uint256", name: "score" },
    { type: "address", name: "player" },
  ];

  try {
    const decodedData = await decodeData(abiTypes, attestData);
    return decodedData.score/10;
  } catch (error) {
    console.error("Error decoding attestation data:", error);
    throw error;
  }
}


export async function calculateTrustScore(playerID: any, targetPlayer :any) {
    const dataArray = getAttestationsData();
    const graph = new TransitiveTrustGraph();
    for (let i = 0; i < dataArray.length; i++) {
        graph.addEdge("AI", dataArray[i].player, DataToScore(dataArray[i].player), 0);
    }

    const provider = new ethers.BrowserProvider(window.ethereum, "any")
    await provider.send("eth_requestAccounts", [])
    
    const signer = provider.getSigner()
    
    const address = await signer.getAddress()

    // Compute trust scores for specific targets
    const scores = graph.computeTrustScores(address, [targetPlayer]);
    console.log(scores);
    return scores.targetPlayer.netScore*100
}

// Output: { D: { positiveScore: 0.2, negativeScore: 0.12, netScore: 0.08 } }


export default getAttestationsData;
