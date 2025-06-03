/* Versão modificada com pequenas melhorias visuais e incrementos funcionais */

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const host = "0.0.0.0";
const port = 5000;
const app = express();

let listaUsuarios = [];

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: "NovaChaveSegura123",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 15,
        httpOnly: true,
        secure: false
    }
}));

function verificarAutenticacao(req, res, next) {
    if (req.session.logado) {
        next();
    } else {
        res.redirect("/login");
    }
}

app.get("/", verificarAutenticacao, (req, res) => {
    const ultimoLogin = req.cookies.ultimoLogin;
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Dashboard</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-light">
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Sistema</a>
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav">
                            <li class="nav-item"><a class="nav-link" href="/cadastroUsuario">Usuários</a></li>
                            <li class="nav-item"><a class="nav-link" href="#">Produtos</a></li>
                        </ul>
                        <span class="navbar-text ms-auto">${ultimoLogin ? "Último acesso: " + ultimoLogin : ""}</span>
                        <a href="/logout" class="btn btn-outline-light ms-3">Sair</a>
                    </div>
                </div>
            </nav>
            <div class="container mt-4">
                <h2>Bem-vindo ao sistema</h2>
            </div>
        </body>
        </html>
    `);
});

app.get("/login", (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Login</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-info">
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-primary text-white">Login</div>
                            <div class="card-body">
                                <form method="POST" action="/login">
                                    <div class="mb-3">
                                        <label for="usuario" class="form-label">Usuário</label>
                                        <input type="text" class="form-control" id="usuario" name="usuario" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="senha" class="form-label">Senha</label>
                                        <input type="password" class="form-control" id="senha" name="senha" required>
                                    </div>
                                    <button type="submit" class="btn btn-success">Entrar</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;
    if (usuario === "admin" && senha === "123") {
        req.session.logado = true;
        res.cookie("ultimoLogin", new Date().toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30 });
        res.redirect("/");
    } else {
        res.send("<p style='color:red'>Usuário ou senha inválidos. <a href='/login'>Tentar novamente</a></p>");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.get("/cadastroUsuario", verificarAutenticacao, (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Usuários</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h3>Cadastro de Usuários</h3>
                <form method="POST" action="/cadastroUsuario">
                    <div class="mb-3">
                        <label class="form-label">Nome</label>
                        <input type="text" name="nome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Sobrenome</label>
                        <input type="text" name="sobrenome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nome de Usuário</label>
                        <input type="text" name="nomeUsuario" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Cidade</label>
                        <input type="text" name="cidade" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">UF</label>
                        <select name="uf" class="form-select" required>
                            <option value="">Selecione</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            <option value="MG">MG</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">CEP</label>
                        <input type="text" name="cep" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post("/cadastroUsuario", verificarAutenticacao, (req, res) => {
    const { nome, sobrenome, nomeUsuario, cidade, uf, cep } = req.body;
    if (nome && sobrenome && nomeUsuario && cidade && uf && cep) {
        listaUsuarios.push({ nome, sobrenome, nomeUsuario, cidade, uf, cep });
        res.redirect("/listaUsuarios");
    } else {
        res.send("<p>Preencha todos os campos. <a href='/cadastroUsuario'>Voltar</a></p>");
    }
});

app.get("/listaUsuarios", verificarAutenticacao, (req, res) => {
    let tabela = listaUsuarios.map(u => `<tr>
        <td>${u.nome}</td><td>${u.sobrenome}</td><td>${u.nomeUsuario}</td><td>${u.cidade}</td><td>${u.uf}</td><td>${u.cep}</td>
    </tr>`).join("");
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Usuários</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-4">
                <h3>Usuários Cadastrados</h3>
                <table class="table table-striped">
                    <thead><tr><th>Nome</th><th>Sobrenome</th><th>Usuário</th><th>Cidade</th><th>UF</th><th>CEP</th></tr></thead>
                    <tbody>${tabela}</tbody>
                </table>
                <a href="/cadastroUsuario" class="btn btn-secondary">Novo Cadastro</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}`);
});
