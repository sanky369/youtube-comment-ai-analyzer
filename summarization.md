#API overview
#Sample code

Checking if the summarizer is available
const canSummarize = await ai.summarizer.capabilities();
let summarizer;
if (canSummarize && canSummarize.available !== 'no') {
if (canSummarize.available === 'readily') {
// The summarizer can immediately be used.
summarizer = await ai.summarizer.create();
} else {
// The summarizer can be used after the model download.
summarizer = await ai.summarizer.create();
summarizer.addEventListener('downloadprogress', (e) => {
console.log(e.loaded, e.total);
});
await summarizer.ready;
}
} else {
// The summarizer can't be used at all.
}

Summarizing a piece of text
const someUserText = 'Hiroshi chuckled as he took a sip of his green tea. It was a typical Monday morning in the life of a Chrome engineer, but the project on his desk was far from ordinary. He was tasked with developing the "isTeapot?" API, a quirky new feature for web developers that would return a HTTP 418 "I\'m a teapot" status code if the requested resource was, in fact, a teapot. The day began with a flurry of code reviews and discussions with his team. They debated the finer points of the API\'s design, including whether to support different teapot types like "kyusu" or "tetsubin". Hiroshi argued for a more inclusive approach, allowing developers to specify any teapot-like object in the request headers. After a lively debate, they settled on a flexible design that allowed for custom teapot definitions. Hiroshi dove into the implementation, his fingers dancing across the keyboard as he crafted the code that would bring this peculiar API to life. He added a few Easter eggs for developers who might stumble upon the feature, including a hidden reference to the Hyper Text Coffee Pot Control Protocol. By lunchtime, Hiroshi had a working prototype. He tested it with a few sample requests, grinning as the "418 I\'m a teapot" response popped up on his screen. He imagined the amusement it would bring to web developers who discovered this hidden gem. As the afternoon progressed, Hiroshi fine-tuned the API, adding documentation and examples to help developers get started. He envisioned a future where websites would display playful teapot animations when the "isTeapot?" API was triggered, adding a touch of whimsy to the internet. As the day wound down, Hiroshi pushed his code to the repository, a sense of satisfaction washing over him. The "isTeapot?" API was a small, quirky feature, but it brought a smile to his face. He knew that somewhere out there, a web developer was going to have a lot of fun with it.';

const result = await summarizer.summarize(someUserText);
console.log(result);

// [TEMPORARY CAVEAT] No longer necessary in the latest Canary (as of 08/29/2024)
// Destroy the summarizer to release resources
// summarizer.destroy();
// Create a new one before attempting to sumarize other text
// summarizer = await ai.summarizer.create();

const someUserText2 = 'The gentle thud reverberated through the lander, followed by a soft silence. Emily unbuckled her harness, her heart pounding in her chest. A million miles away from home, she was the first human to set foot on Mars. She peered through the small window, the rust-colored landscape stretching out as far as the eye could see. A barren, rocky desert bathed in the pale sunlight filtering through the dusty atmosphere. It was breathtakingly beautiful. Taking a deep breath, she grabbed her helmet and put it on. A hiss signaled the pressurization, and her voice echoed in her ears as she spoke, "Emily to Guiana, Eos has landed." She stepped out of the lander, the fine Martian dust crunching under her boots. The low gravity made her feel lighter, each step a small leap. She planted the flag, the blue, white, and red tricolor fluttering in the gentle Martian breeze. Her visor displayed a stream of data: temperature -62°C, atmospheric pressure 6.5 mbar, radiation levels within acceptable limits. She marveled at the technology that allowed her to survive in this harsh environment. She began to explore, her boots leaving the first human footprints on the red planet. Every rock, every dune was a potential scientific treasure. She collected samples, documenting her findings with the helmet camera. As the sun began to set, painting the Martian sky in hues of orange and red, Emily made her way back to the lander. The first day on Mars was a success. She was filled with a sense of awe and wonder, realizing that she was part of something truly historic. The dream of Mars had finally become a reality.';

const result2 = await summarizer.summarize(someUserText2);
console.log(result2);

// Destroy the summarizer to release resources
summarizer.destroy();
Caveats
Here are known temporary limitations:
To summarize different texts, you will first need to destroy the current summarizer to release resources, and create a new one.
We’ll address this inconvenience so that the same summarizer can be used to summarize different pieces of text without interference.
Only English input and output are supported.
We intend to go beyond English content over time. If you haven’t done so already, consider responding to our second survey to help us prioritize the next languages we focus on.
No support of any options (e.g. length guidance, style, etc) for the time being.
The context window is currently limited to 1024 tokens but we use about 26 of those under the hood.
Thanks to your feedback via our second survey, we are exploring how to expand this feature to 4096 tokens, which should meet most developers' needs while maintaining performance and resource usage.
While we work on adding token counting and tracking to our APIs, you can estimate the number of tokens in English content by assuming that 1 token is roughly equal to 4 characters.
Appendix
