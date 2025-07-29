/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// L’Oréal 专用系统提示，要求只回答相关问题，并能记住用户信息和上下文
const systemPrompt =
  "You are an intelligent assistant for L'Oréal. Only answer questions about L'Oréal products, routines, recommendations, and beauty-related topics. Track the conversation context, including the user's name and previous questions, to support natural, multi-turn interactions. If a question is not related to L'Oréal or beauty, politely reply: 'Sorry, I can only answer questions about L'Oréal products, routines, or beauty-related topics.'";

// 初始化消息数组，包含系统提示
let messages = [{ role: "system", content: systemPrompt }];

// 显示初始欢迎语
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! I can recommend L'Oréal products or answer your beauty-related questions.</div>`;

/* 处理表单提交 */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 获取用户输入
  const userMsg = userInput.value.trim();
  if (!userMsg) return;

  // 清空输入框
  userInput.value = "";

  // 添加到消息数组，保留上下文
  messages.push({ role: "user", content: userMsg });

  // 每次提问时，先移除上一个“最新问题”展示（如果有）
  const prevQuestion = document.getElementById("latest-question");
  if (prevQuestion) prevQuestion.remove();

  // 在聊天窗口底部插入最新问题（紧接着 AI 回复之前）
  chatWindow.innerHTML += `<div id="latest-question" class="msg user"><strong>You asked:</strong> ${userMsg}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // 显示“思考中”提示
  chatWindow.innerHTML += `<div class="msg ai">🤔 Generating reply...</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // 调用 OpenAI API，带上完整消息历史以追踪上下文
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
      }),
    });

    const data = await response.json();

    // 获取 AI 回复内容
    const aiMsg =
      data.choices && data.choices[0] && data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "Sorry, I am unable to provide a response at the moment.";

    // 移除“思考中”提示
    chatWindow.innerHTML = chatWindow.innerHTML.replace(
      /<div class="msg ai">🤔 Generating reply...<\/div>$/,
      ""
    );

    // 显示 AI 回复（紧跟在最新问题下方）
    chatWindow.innerHTML += `<div class="msg ai">${aiMsg}</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // 把 AI 回复加入消息数组
    messages.push({ role: "assistant", content: aiMsg });
  } catch (error) {
    // 处理错误
    chatWindow.innerHTML += `<div class="msg ai">Sorry, there was an error. Please try again later.</div>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});

const WORKER_URL = "https://project8-l.chenlingzheng.workers.dev/"; // 替换为你的实际 Worker 地址
