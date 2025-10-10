export const handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        "Access-Control-Allow-Headers": "Content-Type",
    };

    if (event.requestContext?.http?.method === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "CORS preflight check." }),
        };
    }

    try {
        const { prompt = "", diagramType = "flowchart" } = JSON.parse(event.body || "{}");
        
        const fullPrompt = `
        Respond ONLY with a valid Mermaid ${diagramType} diagram inside a \`\`\`mermaid code block.
        Input: ${prompt}`.trim();

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: fullPrompt }],
                temperature: 0.2,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("OpenAI API error:", text);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Failed to fetch from OpenAI API." }),
            };
        }
        
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || "";
        const mermaid = content.replace(/```mermaid|```/g, '').trim();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ diagram: mermaid }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal server error." }),
        };
    }


}