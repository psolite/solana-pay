import { NextResponse } from 'next/server';
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { createSplTransferIx } from '@/component/transfer';
import BigNumber from 'bignumber.js';

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
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const MERCHANT = "ErmmBxNaxeJ12JAUhiALqfkLsHXXSXQeo6txBZB3hBrs";

    const splToken = new PublicKey(USDC_MINT);
    const MERCHANT_WALLET = new PublicKey(MERCHANT);

    try {
        console.log('started processing POST request');
        const body = await request.json();

        const accountField = body?.account;
        if (!accountField) throw new Error('missing account');

        const sender = new PublicKey(accountField);

        // create spl transfer instruction
        const calculateCheckoutAmount = () => new BigNumber(0.1); // Replace with actual logic
        const splTransferIx = await createSplTransferIx(sender, splToken, MERCHANT_WALLET, calculateCheckoutAmount);

        // create the transaction
        const transaction = new VersionedTransaction(
            new TransactionMessage({
                payerKey: sender,
                recentBlockhash: '11111111111111111111111111111111',
                // add the instruction to the transaction
                instructions: [splTransferIx]
            }).compileToV0Message()
        );

        const serializedTransaction = transaction.serialize();

        const base64Transaction = Buffer.from(serializedTransaction).toString('base64');
        const message = 'Thank you for your purchase of ExiledApe #518';

        // Example response for POST request
        const data = { transaction: base64Transaction, message };
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error processing POST request:', error);
        return NextResponse.json({ error: 'Failed to process POST request' }, { status: 500 });
    }
}