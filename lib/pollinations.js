const axios = require("axios");

const pollinations = {
  api: { chat: "https://text.pollinations.ai",
    image: "https://image.pollinations.ai/prompt",
    voice: "https://text.pollinations.ai"
  },

  header: {
    'Connection': 'keep-alive',
    'sec-ch-ua-platform': '"Android"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="136", "Android WebView";v="136", "Not.A/Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'Accept': '*/*',
    'Origin': 'https://freeai.aihub.ren',
    'X-Requested-With': 'mark.via.gp',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Referer': 'https://freeai.aihub.ren/',
    'Accept-Language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7'
  },

  models: {
    chat: [
      {
        name: "openai",
        type: "chat",
        censored: true,
        description: "OpenAI GPT-4o-mini",
        baseModel: true,
        vision: true,
        group: "OpenAI"
      },
      {
        name: "openai-large",
        type: "chat",
        censored: true,
        description: "OpenAI GPT-4o",
        baseModel: true,
        vision: true,
        group: "OpenAI"
      },
      {
        name: "openai-reasoning",
        type: "chat",
        censored: true,
        description: "OpenAI o1-mini",
        baseModel: true,
        reasoning: true,
        group: "OpenAI"
      },
      {
        name: "qwen-coder",
        type: "chat",
        censored: true,
        description: "Qwen 2.5 Coder 32B",
        baseModel: true,
        group: "Qwen"
      },
      {
        name: "llama",
        type: "chat",
        censored: false,
        description: "Llama 3.3 70B",
        baseModel: true,
        group: "Meta"
      },
      {
        name: "mistral",
        type: "chat",
        censored: false,
        description: "Mistral Nemo",
        baseModel: true,
        group: "Mistral"
      },
      {
        name: "deepseek",
        type: "chat",
        censored: true,
        description: "DeepSeek-V3",
        baseModel: true,
        group: "DeepSeek"
      },
      {
        name: "claude",
        type: "chat",
        censored: true,
        description: "Claude 3.5 Haiku",
        baseModel: true,
        group: "Anthropic"
      },
      {
        name: "deepseek-r1",
        type: "chat",
        censored: true,
        description: "DeepSeek-R1 Distill Qwen 32B",
        baseModel: true,
        reasoning: true,
        provider: "cloudflare",
        group: "DeepSeek"
      },
      {
        name: "deepseek-reasoner",
        type: "chat",
        censored: true,
        description: "DeepSeek R1 - Full",
        baseModel: true,
        reasoning: true,
        provider: "deepseek",
        group: "DeepSeek"
      },
      {
        name: "gemini",
        type: "chat",
        censored: true,
        description: "Gemini 2.0 Flash",
        baseModel: true,
        provider: "google",
        group: "Google"
      },
      {
        name: "phi",
        type: "chat",
        censored: true,
        description: "Phi-4 Multimodal Instruct",
        baseModel: true,
        group: "Microsoft"
      }
    ],
    image: [
      {
        name: "flux",
        type: "image",
        censored: true,
        description: "Universal model, suitable for most scenarios",
        baseModel: true,
        vision: true,
        group: "Flux"
      },
      {
        name: "FLUX-PRO",
        type: "image",
        censored: true,
        description: "Provides professional quality advanced models",
        baseModel: true,
        vision: true,
        group: "Flux"
      },
      {
        name: "turbo",
        type: "image",
        censored: true,
        description: "Generate models quickly, speed first",
        baseModel: true,
        vision: true,
        group: "Turbo"
      }
    ],
    voice: [
      {
        "name": "Alloy",
        "desc": "å¹³è¡¡ä¸­æ€§",
        "value": "alloy"
      },
      {
        "name": "Echo",
        "desc": "æ·±æ²‰æœ‰åŠ›",
        "value": "echo"
      },
      {
        "name": "Nova",
        "desc": "å‹å¥½ä¸“ä¸š",
        "value": "nova"
      }
    ]
  },

  chat: async (question, modelIndex = 0) => {
    const model = pollinations.models.chat[modelIndex]?.name || "openai";
    try {
      const apiUrl = pollinations.api.chat;
      const headers = pollinations.header;
      
      const response = await axios.get(`${apiUrl}/${encodeURIComponent(question)}`, {
        params: {
          'model': model
        },
        headers: headers
      });

      return response.data;
    } catch (error) {
      return error.message || "chat request failed";
    }
  },

  image: async (prompt, modelIndex = 0, option = {}) => {
    const model = pollinations.models.image[modelIndex]?.name || "flux";
    const params = {
      prompt,
      model,
      width: option.width || "720",
      height: option.height || "1280",
      seed: option.seed ?? Math.floor(Math.random() * 2147483647),
      nologo: option.nologo ?? true,
      safe: option.safe ?? false,
      negative_prompt: option.negative_prompt || "worst quality, blurry"
    };

    let imageUrl = `${pollinations.api.image}/${params.prompt}`;
    imageUrl += `?width=${params.width}&height=${params.height}&seed=${params.seed}&model=${params.model}`;
    imageUrl += `&negative_prompt=${params.negative_prompt}`;
    imageUrl += `&nologo=${params.nologo}`;
    imageUrl += `&safe=${params.safe}`;

    return imageUrl;
  },

  voice: async (text, modelIndex = 0) => {
    const voice = pollinations.models.voice[modelIndex]?.value || "alloy";
    
    let voiceUrl = `${pollinations.api.voice}/${text}`;
    voiceUrl += `?model=openai-audio&voice=${voice}`;
    return voiceUrl;
  }
};

module.exports = pollinations;
