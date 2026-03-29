
interface TextBeeConfig {
    apiKey: string;
    deviceId: string;
    serverUrl: string;
}

interface SendSMSResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export async function sendSMS(phoneNumber: string, message: string): Promise<SendSMSResponse> {
    const config: TextBeeConfig = {
        apiKey: process.env.TEXTBEE_API_KEY || "",
        deviceId: process.env.TEXTBEE_DEVICE_ID || "",
        serverUrl: process.env.TEXTBEE_SERVER_URL || "",
    };

    if (!config.apiKey || !config.deviceId || !config.serverUrl) {
        console.error("TextBee configuration missing");
        return { success: false, message: "Server configuration missing" };
    }

    // Correct TextBee API endpoint: /api/v1/gateway/devices/{deviceId}/send-sms
    const baseUrl = config.serverUrl.replace(/\/$/, "");
    const endpoint = `${baseUrl}/api/v1/gateway/devices/${config.deviceId}/send-sms`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": config.apiKey,   // TextBee uses x-api-key, not Bearer
            },
            body: JSON.stringify({
                recipients: [phoneNumber],     // TextBee uses 'recipients' array
                message: message,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("TextBee API Error:", response.status, errorText);
            return { success: false, message: `TextBee API failed: ${response.statusText}` };
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error("Failed to send SMS via TextBee:", error);
        return { success: false, message: "Network error or invalid request" };
    }
}
