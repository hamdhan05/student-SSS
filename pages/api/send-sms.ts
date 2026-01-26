import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSMS } from '../../lib/textbee';

type Data = {
    success: boolean;
    message?: string;
    data?: any;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ success: false, message: 'Missing phoneNumber or message' });
    }

    try {
        const result = await sendSMS(phoneNumber, message);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (error) {
        console.error("API Error sending SMS:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
