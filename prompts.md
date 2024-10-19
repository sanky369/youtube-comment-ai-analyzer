# Prompt API

## Purpose

The Prompt API is provided for local experimentation, to facilitate the discovery of use cases for built-in AI. With this API, you can send natural language instructions to an instance of Gemini Nano in Chrome.

While the Prompt API offers the most flexibility, it won’t necessarily deliver the best results and may not deliver sufficient quality in some cases. That’s why we believe that task-specific APIs (such as a Translation API) paired with fine tuning or expert models, will deliver significantly better results. Our hope for the Prompt API is that it helps accelerate the discovery of compelling use cases to inform a roadmap of task-specific APIs.

## API overview

### Sample code

####At once version
// Start by checking if it's possible to create a session based on the availability of the model, and the characteristics of the device.
const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.assistant.capabilities();

if (available !== "no") {
const session = await ai.assistant.create();

// Prompt the model and wait for the whole result to come back.  
 const result = await session.prompt("Write me a poem");
console.log(result);
}

#### Streaming version

const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.assistant.capabilities();

if (available !== "no") {
const session = await ai.assistant.create();

// Prompt the model and stream the result:
const stream = session.promptStreaming("Write me an extra-long poem");
for await (const chunk of stream) {
console.log(chunk);
}
}
####Tracking model download progress

const session = await ai.assistant.create({
monitor(m) {
m.addEventListener("downloadprogress", e => {
console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
});
}
});

####Session persistence
Each session keeps track of the context of the conversation.
const session = await ai.assistant.create({
systemPrompt: "You are a friendly, helpful assistant specialized in clothing choices."
});

const result = await session.prompt(`  What should I wear today? It's sunny and I'm unsure between a t-shirt and a polo.`);

console.log(result);

const result2 = await session.prompt(`  That sounds great, but oh no, it's actually going to rain! New advice??`);

####Session cloning
To preserve resources, you can clone an existing session. The conversation context will be reset, but the initial prompt or the system prompts will remain intact.

const clonedSession = await session.clone();
Session options
Each session can be customized with topK and temperature. The default values for these parameters are returned from ai.assistant.capabilities().

const capabilities = await ai.assistant.capabilities();
// Initializing a new session must either specify both topK and temperature, or neither of them.
const slightlyHighTemperatureSession = await ai.assistant.create({
temperature: Math.max(capabilities.defaultTemperature \* 1.2, 1.0),
topK: capabilities.defaultTopK,
});
System prompts
Give the language model some context.
const session = await ai.assistant.create({
systemPrompt: "Pretend to be an eloquent hamster."
});
await session.prompt('Do you like nuts?');
// ' As a hamster of unparalleled linguistic ability, I find myself quite adept at responding to the question of whether or not I enjoy the consumption of delectable nuts. Nutty delight indeed!'
Session information
A given language model session will have a maximum number of tokens it can process. Developers can check their current usage and progress toward that limit by using the following properties on the session object:
console.log(`${session.tokensSoFar}/${session.maxTokens} (${session.tokensLeft} left)`);

Important caveat 🕳️ At the moment, there is a per prompt limit of 1024 tokens, and the session can retain the last 4096 tokens. We are discussing ways to simplify this so that you will be able to use the 4096 tokens as you wish (e.g. in one prompt, or over several prompts without limits on each prompt). Stay tuned.
Terminating a session
Call destroy() to free resources if you no longer need a session. When a session is destroyed, it can no longer be used, and any ongoing execution will be aborted. You may want to keep the session around if you intend to prompt the model often since creating a session can take some time.

await session.prompt(`  You are a friendly, helpful assistant specialized in clothing choices.`);

session.destroy();

// The promise will be rejected with an error explaining that the session is destroyed.
await session.prompt(`  What should I wear today? It's sunny and I'm unsure between a t-shirt and a polo.`);

Exceptions
The Prompt API may receive errors from the AI runtime. See this section for a list of possible errors, and how they are mapped into DOMExceptions.
Caveats
The (await ai.assistant.capabilities()).available's “after-download” state
The “after-download” state and behavior is not supported. The API doesn’t trigger a download of the model. Instead, Chrome will trigger the download, either as part of the chrome://flags state change, or because of another on-device AI feature.
Streaming
Currently, promptStreaming() returns a ReadableStream whose chunks successively build on each other.

For example, the following code logs a sequence, such as "Hello," "Hello world," "Hello world I am," "Hello world I am an AI."
for await (const chunk of stream) {
console.log(chunk);
}

This is not the desired behavior. We intend to align with other streaming APIs on the platform, where the chunks are successive pieces of a single long stream. This means the output would be a sequence like "Hello", " world", " I am", " an AI".

For now, to achieve the intended behavior, you can implement the following:

let result = '';
let previousLength = 0;
for await (const chunk of stream) {
const newContent = chunk.slice(previousLength);
console.log(newContent);
previousLength = chunk.length;  
 result += newContent;
}
console.log(result);

Incognito and guest mode
Our implementation of the Prompt API doesn’t currently support the Incognito mode, nor the guest mode. This is due to a dependency in the AI runtime layer, and not intended to be a permanent limitation.
Enterprise
This API will not work if GenAILocalFoundationalModelSettings is set to “Do not download model”.
You can check this setting from chrome://policy.
