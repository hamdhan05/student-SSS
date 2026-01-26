
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

    // Ensure serverUrl doesn't end with a slash for consistent path joining
    const baseUrl = config.serverUrl.replace(/\/$/, "");

    try {
        const response = await fetch(`${baseUrl}/api/send-sms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                deviceId: config.deviceId,
                phoneNumber: phoneNumber,
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
