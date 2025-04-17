import { NextResponse } from 'next/server';
import { clusterApiUrl, Connection, PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { createSplTransferIx } from '@/component/transfer';

export async function GET(request: Request) {
    try {
        console.log(request);
        // Example response for GET request

        const label = 'Airbills';
        const icon = 'https://app.airbillspay.com/favicon.ico';

        const data = {
            label,
            icon,
        };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error processing GET request:', error);
        return NextResponse.json({ error: 'Failed to process GET request' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    const MERCHANT = "ErmmBxNaxeJ12JAUhiALqfkLsHXXSXQeo6txBZB3hBrs"

    const splToken = new PublicKey(USDC_MINT);
    const MERCHANT_WALLET = new PublicKey(MERCHANT);
    try {
        console.log('started processing POST request');
        const body = await request.json();

        const accountField = body?.account;
        if (!accountField) throw new Error('missing account');

        const sender = new PublicKey(accountField);
        const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
        const recentBlockhash = await connection.getLatestBlockhash();

        // create spl transfer instruction
        const splTransferIx = await createSplTransferIx(sender, connection, splToken, MERCHANT_WALLET, new BigNumber(100000));
        console.log('splTransferIx passed');
        // create the transaction
        const transaction = new VersionedTransaction(
            new TransactionMessage({
                payerKey: sender,
                recentBlockhash: recentBlockhash.blockhash,
                // add the instruction to the transaction
                instructions: [splTransferIx]
            }).compileToV0Message()
        )
        console.log('transaction passed');
        const serializedTransaction = transaction.serialize()

        const base64Transaction = Buffer.from(serializedTransaction).toString('base64');
        const message = 'Thank you for your purchase!';
        console.log('base64Transaction passed');

        // Example response for POST request
        const data = { transaction: base64Transaction, message };
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error processing POST request:', error);
        return NextResponse.json({ error: 'Failed to process POST request' }, { status: 500 });
    }
}