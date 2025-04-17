import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

export async function createSplTransferIx(sender: PublicKey, splToken: PublicKey, MERCHANT_WALLET: PublicKey) {
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const senderInfo = await connection.getAccountInfo(sender);
    if (!senderInfo) throw new Error('sender not found');

    // Get the sender's ATA and check that the account exists and can send tokens
    const senderATA = await getAssociatedTokenAddress(splToken, sender);
    const senderAccount = await getAccount(connection, senderATA);
    if (!senderAccount.isInitialized) throw new Error('sender not initialized');
    if (senderAccount.isFrozen) throw new Error('sender frozen');

    // Get the merchant's ATA and check that the account exists and can receive tokens
    const merchantATA = await getAssociatedTokenAddress(splToken, MERCHANT_WALLET);
    const merchantAccount = await getAccount(connection, merchantATA);
    if (!merchantAccount.isInitialized) throw new Error('merchant not initialized');
    if (merchantAccount.isFrozen) throw new Error('merchant frozen');

    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, splToken);
    if (!mint.isInitialized) throw new Error('mint not initialized');

    // Check that the sender has enough tokens
    const tokens = Math.floor(Number(0.2) * Math.pow(10, 6));
    if (tokens > senderAccount.amount) throw new Error('insufficient funds');

    // Create an instruction to transfer SPL tokens, asserting the mint and decimals match
    const splTransferIx = createTransferCheckedInstruction(
        senderATA,
        splToken,
        merchantATA,
        sender,
        tokens,
        mint.decimals
    );

    // Create a reference that is unique to each checkout session
    const references = [new Keypair().publicKey];

    // add references to the instruction
    for (const pubkey of references) {
        splTransferIx.keys.push({ pubkey, isWritable: false, isSigner: false });
    }
    const transaction = new Transaction()
    transaction.add(splTransferIx)
        
    const latestBlockHash = await connection.getLatestBlockhash({ commitment: "finalized" });
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.feePayer = sender;

    const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
    });

    return serializedTransaction;
}