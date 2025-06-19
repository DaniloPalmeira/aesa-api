import express, { Application, Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

import dotenv from "dotenv";
dotenv.config();

interface UserData {
  nome: string;
  fotoUrl: string | null;
  curso: string;
  vinculo: string;
  matricula: string;
  validade: string;
}

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());

app.post("/api/login", async (req: Request, res: Response) => {
  const { user, password }: { user?: string; password?: string } = req.body;

  if (!user || !password) {
    res.status(400).json({ error: "Usuário e senha são obrigatórios." });
    return;
  }

  const browserHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded",
    Referer: "https://aesa-cesa.br/carteirinha/",
    Origin: "https://aesa-cesa.br",
  };

  try {
    const loginData = new URLSearchParams();
    loginData.append("user", user);
    loginData.append("password", password);
    loginData.append("submit", "Entrar");

    const loginResponse = await axios.post(
      "https://aesa-cesa.br/carteirinha/public/login",
      loginData,
      {
        headers: browserHeaders,
        maxRedirects: 0,
        validateStatus: (status) => status < 500,
      }
    );

    if (loginResponse.status !== 302) {
      console.log("Falha no login. Status:", loginResponse.status);
      res
        .status(401)
        .json({ error: "Login falhou. Usuário ou senha inválidos." });
      return;
    }

    const sessionCookie = loginResponse.headers["set-cookie"]?.[0];
    if (!sessionCookie) {
      res
        .status(500)
        .json({ error: "Não foi possível obter o cookie de sessão." });
      return;
    }

    const carteiraResponse = await axios.get(
      "https://aesa-cesa.br/carteirinha/public/carteira.php",
      {
        headers: {
          Cookie: sessionCookie,
          "User-Agent": browserHeaders["User-Agent"],
          Referer: "https://aesa-cesa.br/carteirinha/public/login",
        },
      }
    );

    const $ = cheerio.load(carteiraResponse.data);

    const getTextAfter = (label: string): string =>
      $(`h4:contains('${label}')`).next("h3").text().trim();

    const fotoUrlRelativa = $(".foto").attr("src");
    const fotoUrlCompleta = fotoUrlRelativa
      ? `https://aesa-cesa.br/carteirinha/public/${fotoUrlRelativa}`
      : null;

    const userData: UserData = {
      nome: $(".informacoess > h2").text().trim(),
      fotoUrl: fotoUrlCompleta,
      curso: getTextAfter("Curso:"),
      vinculo: getTextAfter("Vínculo:"),
      matricula: $('.matricula h4:contains("Matrícula:")')
        .nextAll("h3")
        .first()
        .text()
        .trim(),
      validade: $('.matricula h4:contains("Validade:")')
        .nextAll("h3")
        .first()
        .text()
        .trim(),
    };

    res.status(200).json(userData);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Ocorreu um erro:", error.message);
    } else {
      console.error("Ocorreu um erro desconhecido:", error);
    }
    res
      .status(500)
      .json({ error: "Ocorreu um erro interno ao processar a solicitação." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`✨ Inicie em modo de desenvolvimento com: npm run dev`);
});
