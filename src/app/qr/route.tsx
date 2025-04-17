import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Example response for GET request
      
            const label = 'Exiled Apes Academy';
            const icon = 'https://exiledapes.academy/wp-content/uploads/2021/09/X_share.png';
        
            const data ={
                label,
                icon,
            };
      
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process GET request' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Example response for POST request
        const data = { message: 'POST request successful', receivedData: body };
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process POST request' }, { status: 500 });
    }
}