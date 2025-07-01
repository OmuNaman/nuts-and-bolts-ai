<div align="center">
  <h1>Nuts & Bolts AI</h1>
  <p>
    <b>Stop just <i>using</i> AI. Start <strong>understanding</strong> it.</strong>
  </p>
  <p>
    An interactive educational platform that demystifies complex AI concepts through hands-on, visual learning modules.
  </p>
  <br />
  <a href="https://vizuara-ai-learning-lab.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-Nuts&Bolts AI-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/OmuNaman/nuts-and-bolts-ai.git" target="_blank">
    <img src="https://img.shields.io/github/stars/OmuNaman/nuts-and-bolts-ai?style=for-the-badge&logo=github&color=blue" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/OmuNaman/nuts-and-bolts-ai/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/OmuNaman/nuts-and-bolts-ai?style=for-the-badge&color=informational" alt="License" />
  </a>
</div>

<br />

## 🔩 What is This?

Tired of AI feeling like magic? It's not. It's math. Hard, but beautiful math. **Nuts & Bolts AI** rips open the black box and lets you get your hands dirty with the core mechanisms that power modern AI.

This isn't another high-level overview. This is a learning lab where you **perform the calculations yourself**, step-by-step, and see the immediate impact of your work. From the fundamental dot-product in an attention head to the gradient flow in backpropagation, you'll build an intuition that reading alone can't provide.

---

## ✨ Features

-   🧠 **Truly Interactive:** Don't just watch. Calculate matrix values, see the results, and get immediate feedback.
-   📊 **Component-by-Component:** Each major AI concept is broken down into a visual, node-based workflow. See how data flows from input to output.
-   ⚙️ **Foundational Concepts:** Master the building blocks, from basic regressions to the advanced attention mechanisms in models like DeepSeek-V2.
-   🚀 **Modern Tech Stack:** Built with Vite, React, TypeScript, and ReactFlow for a fast, modern, and extensible experience.
-   🎨 **Sleek & Themed:** Because learning shouldn't be ugly. Comes with a beautiful dark/light mode toggle.
-   🔒 **User Accounts:** Save your progress and track your learning journey with Supabase-powered authentication.
-   👨‍💻 **Admin Dashboard:** A built-in dashboard for managing users and viewing analytics.

---

## 📚 Available Learning Modules

This is what you're here for. Dive into any of these modules to get started.

| Icon | Module                                     | Status      | Key Concepts                                      |
| :--: | ------------------------------------------ | :---------- | ------------------------------------------------- |
| 🧠   | **Self-Attention (Single-Head)**           | `Available` | `Q, K, V`, `Scaled Dot-Product`, `Softmax`          |
| 🤖   | **Multi-Head Attention**                   | `Available` | `Parallel Heads`, `Concatenation`, `Output Projection` |
| 📉   | **Linear Regression**                      | `Available` | `MSE Loss`, `Gradient Descent`, `Parameter Updates`   |
| 📈   | **Logistic Regression**                    | `Available` | `Sigmoid`, `Binary Cross-Entropy`, `Classification` |
| 🌐   | **Neural Network Epoch**                   | `Available` | `Forward/Backward Propagation`, `Activation`, `Gradients` |
| 🔄   | **Recurrent Neural Network (RNN)**         | `Available` | `Hidden States`, `Sequential Data`, `BPTT`            |
| 🖼️   | **Convolutional Neural Network (CNN)**     | `Available` | `Convolution`, `ReLU`, `Max Pooling`, `Feature Maps`  |
| 💬   | **Word2Vec (CBOW)**                        | `Available` | `Embeddings`, `Context/Target`, `Semantic Space`      |
| ✨   | **Multi-Head Latent Attention (MLA)**      | `Available` | `KV Cache Compression`, `Latent Bottleneck`         |
| 🔗   | **MLA with Query Compression**             | `Available` | `Full Latent Path`, `Deeper Compression`            |
| 🌀   | **MLA with Decoupled RoPE**                | `Available` | `Rotary Positional Embeddings`, `Sequence Awareness`  |

---

## 🛠️ Tech Stack

This project is built with a modern, performant, and type-safe stack.

| Category      | Technology                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| **Core**      | ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) |
| **Styling**   | ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Shadcn/UI](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) |
| **Animation** | ![Framer Motion](https://img.shields.io/badge/framer--motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)                                                                                              |
| **Graphs**    | ![React Flow](https://img.shields.io/badge/React_Flow-000000?style=for-the-badge&logo=reactflow&logoColor=white)                                                                                             |
| **Backend**   | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)                                                                                                   |
| **Deployment**| ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)                                                                                                    |

---

## 🚀 Getting Started

Want to run this on your local machine? Let's do it.

### Prerequisites

-   **Node.js**: `v20.x` or higher is recommended.
-   **Package Manager**: `npm` or `bun`.

### Local Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/OmuNaman/nuts-and-bolts-ai.git
    cd nuts-and-bolts-ai
    ```

2.  **Set up your environment variables:**
    Create a file named `.env` in the root of the project and add your Supabase credentials. You can get these from your Supabase project dashboard.

    ```env
    # .env
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL_HERE"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
    ```

3.  **Install dependencies:**
    ```sh
    # Using npm
    npm install

    # Or using bun
    bun install
    ```

4.  **Run the development server:**
    ```sh
    # Using npm
    npm run dev

    # Or using bun
    bun run dev
    ```

The application should now be running at `http://localhost:5173` (or the next available port).

---

## 🚢 Deployment

This project is configured for seamless deployment on **Vercel**.

1.  **Fork this repository.**
2.  Import the project into your Vercel dashboard.
3.  Vercel will automatically detect the **Vite** framework preset.
4.  **Add your environment variables** (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in the project settings on Vercel.
5.  Deploy!

The included `vercel.json` handles the necessary rewrites for client-side routing, so all routes like `/learning/self-attention` will work correctly.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

Omu Naman - [@OmuNaman](https://twitter.com/OmuNaman)

Project Link: [https://github.com/OmuNaman/nuts-and-bolts-ai.git](https://github.com/OmuNaman/nuts-and-bolts-ai.git)
