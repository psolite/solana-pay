import { createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

export async function createSplTransferIx(sender: PublicKey, connection: Connection, splToken: PublicKey, MERCHANT_WALLET: PublicKey, amount: BigNumber) {

    const sourceAccountAta = await getAssociatedTokenAddress(splToken, sender);
    const destinationAccountAta = await getAssociatedTokenAddress(splToken, MERCHANT_WALLET);

    // Check if the ATAs already exist
    const sourceAccount = await connection.getAccountInfo(sourceAccountAta);
    const destinationAccount = await connection.getAccountInfo(destinationAccountAta);
    const demcial = 6;

    // Create the transfer instruction
    const transferInstruction = createTransferInstruction(
        sourceAccountAta,
        destinationAccountAta,
        sender,  // owner of the source token account
        Math.floor(Number(0.2) * Math.pow(10, demcial))  // amount in smallest units (e.g., lamports for SOL)
    );

    // Create a transaction
    const transaction = new Transaction()

    if (!sourceAccount) {
        transaction.add(createAssociatedTokenAccountInstruction(
            sender,
            sourceAccountAta,
            sender,
            splToken
        ));
    }

    if (!destinationAccount) {
        transaction.add(createAssociatedTokenAccountInstruction(
            sender,
            destinationAccountAta,
            MERCHANT_WALLET,
            splToken
        ));
    }
    transaction.add(transferInstruction);

    const latestBlockHash = await connection.getLatestBlockhash({ commitment: "finalized" });
    transaction.recentBlockhash = latestBlockHash.blockhash;

    const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
    });

    return serializedTransaction;
}
