import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

const host = "0.0.0.0";
const port = 5500;
const app = express();

let listaUsuarios = [];
let listaProdutos = [];

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
        res.send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Acesso Negado</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-dark text-light d-flex justify-content-center align-items-center vh-100">
                <div class="text-center">
                    <h3>Você precisa estar logado para acessar esta página.</h3>
                    <a href="/login" class="btn btn-primary mt-3">Ir para Login</a>
                </div>
            </body>
            </html>
        `);
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
        <body class="bg-dark text-light">
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Sistema</a>
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item"><a class="nav-link text-light" href="/cadastroUsuario">Usuários</a></li>
                            <li class="nav-item"><a class="nav-link text-light" href="/cadastroProduto">Produtos</a></li>
                        </ul>
                        <span class="navbar-text me-3">
                            Usuário: <strong>${req.session.usuarioNome || "Desconhecido"}</strong>
                        </span>
                        <span class="navbar-text me-3">
                            Último acesso: ${ultimoLogin ? ultimoLogin : "N/D"}
                        </span>
                        <a href="/logout" class="btn btn-outline-light">Sair</a>
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
            <style>
                body { background-color: #121212; color: #eee; }
                ::placeholder { color: #bbb; opacity: 1; }
            </style>
        </head>
        <body class="d-flex justify-content-center align-items-center vh-100">
            <div class="card bg-secondary text-light" style="width: 360px;">
                <div class="card-header bg-dark text-center">
                    <h4>Login</h4>
                </div>
                <div class="card-body">
                    <form method="POST" action="/login" novalidate>
                        <div class="mb-3">
                            <label for="usuario" class="form-label">Usuário</label>
                            <input type="text" class="form-control bg-dark text-light border-light" id="usuario" name="usuario" placeholder="Digite seu usuário" required>
                        </div>
                        <div class="mb-3">
                            <label for="senha" class="form-label">Senha</label>
                            <input type="password" class="form-control bg-dark text-light border-light" id="senha" name="senha" placeholder="Digite sua senha" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Entrar</button>
                    </form>
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
        req.session.usuarioNome = usuario;
        res.cookie("ultimoLogin", new Date().toLocaleString(), { maxAge: 1000 * 60 * 60 * 24 * 30 });
        res.redirect("/");
    } else {
        res.send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Erro no Login</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <style> body { background-color: #121212; color: #f44336; } </style>
            </head>
            <body class="d-flex flex-column justify-content-center align-items-center vh-100">
                <h3>Usuário ou senha inválidos.</h3>
                <a href="/login" class="btn btn-outline-light mt-3">Tentar novamente</a>
            </body>
            </html>
        `);
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.get("/cadastroUsuario", verificarAutenticacao, (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Usuários</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #121212; color: #eee; }
                ::placeholder { color: #bbb; opacity: 1; }
            </style>
        </head>
        <body>
            <div class="container mt-5">
                <h3>Cadastro de Usuários</h3>
                <form method="POST" action="/cadastroUsuario" novalidate>
                    <div class="mb-3">
                        <label class="form-label">Nome</label>
                        <input type="text" name="nome" class="form-control bg-dark text-light border-light" placeholder="Digite seu nome" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Sobrenome</label>
                        <input type="text" name="sobrenome" class="form-control bg-dark text-light border-light" placeholder="Digite seu sobrenome" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nome de Usuário</label>
                        <input type="text" name="nomeUsuario" class="form-control bg-dark text-light border-light" placeholder="Digite seu nome de usuário" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Cidade</label>
                        <input type="text" name="cidade" class="form-control bg-dark text-light border-light" placeholder="Digite sua cidade" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">UF</label>
                        <select name="uf" class="form-select bg-dark text-light border-light" required>
                            <option value="" disabled selected>Selecione</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            <option value="MG">MG</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">CEP</label>
                        <input type="text" name="cep" class="form-control bg-dark text-light border-light" placeholder="Digite o CEP" required>
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
        res.send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Erro no Cadastro</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>body { background-color: #121212; color: #f44336; }</style>
            </head>
            <body class="d-flex flex-column justify-content-center align-items-center vh-100">
                <h3>Preencha todos os campos.</h3>
                <a href="/cadastroUsuario" class="btn btn-outline-light mt-3">Voltar</a>
            </body>
            </html>
        `);
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
            <style>body { background-color: #121212; color: #eee; }</style>
        </head>
        <body>
            <div class="container mt-4">
                <h3>Usuários Cadastrados</h3>
                <table class="table table-striped table-dark">
                    <thead><tr><th>Nome</th><th>Sobrenome</th><th>Usuário</th><th>Cidade</th><th>UF</th><th>CEP</th></tr></thead>
                    <tbody>${tabela}</tbody>
                </table>
                <a href="/cadastroUsuario" class="btn btn-secondary">Novo Cadastro</a>
                <a href="/" class="btn btn-primary ms-2">Voltar ao Dashboard</a>
            </div>
        </body>
        </html>
    `);
});

app.get("/cadastroProduto", verificarAutenticacao, (req, res) => {
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Produtos</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #121212; color: #eee; }
                ::placeholder { color: #bbb; opacity: 1; }
            </style>
        </head>
        <body>
            <div class="container mt-5">
                <h3>Cadastro de Produtos</h3>
                <form method="POST" action="/cadastroProduto" novalidate>
                    <div class="mb-3">
                        <label class="form-label">Nome do Produto</label>
                        <input type="text" name="nome" class="form-control bg-dark text-light border-light" placeholder="Nome do produto" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Preço</label>
                        <input type="number" step="0.01" name="preco" class="form-control bg-dark text-light border-light" placeholder="Preço em R$" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Cadastrar Produto</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post("/cadastroProduto", verificarAutenticacao, (req, res) => {
    const { nome, preco } = req.body;
    if (nome && preco) {
        listaProdutos.push({ nome, preco: parseFloat(preco).toFixed(2) });
        res.redirect("/listaProdutos");
    } else {
        res.send(`
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Erro no Cadastro</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>body { background-color: #121212; color: #f44336; }</style>
            </head>
            <body class="d-flex flex-column justify-content-center align-items-center vh-100">
                <h3>Preencha todos os campos do produto.</h3>
                <a href="/cadastroProduto" class="btn btn-outline-light mt-3">Voltar</a>
            </body>
            </html>
        `);
    }
});

app.get("/listaProdutos", verificarAutenticacao, (req, res) => {
    let tabela = listaProdutos.map(p => `<tr><td>${p.nome}</td><td>R$ ${p.preco}</td></tr>`).join("");
    res.send(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Produtos</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>body { background-color: #121212; color: #eee; }</style>
        </head>
        <body>
            <div class="container mt-4">
                <h3>Produtos Cadastrados</h3>
                <table class="table table-dark table-striped">
                    <thead><tr><th>Nome</th><th>Preço</th></tr></thead>
                    <tbody>${tabela}</tbody>
                </table>
                <a href="/cadastroProduto" class="btn btn-secondary">Novo Produto</a>
                <a href="/" class="btn btn-primary ms-2">Voltar ao Dashboard</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, host, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
