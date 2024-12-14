export async function WalletCall() {
    try {
        const response = await fetch('http://localhost:3000/wallet');
        const data = await response.json();
        return data.message; // Return the message from the backend
    } catch (error) {
        console.error('Error fetching data:', error);
        return 'Error fetching data'; // Return error message
    }
}
