# Quiz Template - Guia de Uso

Este é um template de quiz que permite criar questionários para diferentes matérias, bastando trocar os arquivos JSON de questões.

## Estrutura do Projeto

```
├── index.html - Página principal do quiz
├── css/
│   └── styles.css - Estilos do quiz
├── js/
│   ├── config.js - Configurações personalizáveis
│   ├── data.js - Gerenciamento de dados e carregamento das questões
│   └── app.js - Lógica principal do aplicativo
└── subjects/ - Pasta com todas as especialidades
    ├── GO/
    │   ├── GOQuestions/ - Arquivos JSON com questões de GO
    │   ├── GOImages/ - Imagens das questões de GO
    │   ├── GOGuias/ - Arquivos markdown com guias
    │   └── GOResumos/ - Arquivos markdown com resumos
    └── CardioPneumo/
        ├── CardioPneumoQuestions/ - Arquivos JSON com questões
        ├── CardioPneumoImages/ - Imagens das questões
        ├── CardioPneumoGuias/ - Arquivos markdown com guias
        └── CardioPneumoResumos/ - Arquivos markdown com resumos
```

## Como Personalizar

### 1. Configuração Básica

Edite o arquivo `js/config.js` para personalizar:

- **Título do Quiz**: Altere o valor da propriedade `title` para o nome da sua matéria
- **Chave de Armazenamento**: Altere o valor da propriedade `storageKey` para evitar conflitos com outros quizzes
- **Módulos**: Configure a lista de módulos disponíveis, cada um com:
  - `id`: Identificador único do módulo
  - `name`: Nome exibido na interface
  - `file`: Nome do arquivo JSON (sem a extensão .json)

### 2. Criação de Arquivos de Questões

Crie arquivos JSON seguindo o formato dos exemplos:

#### Questão sem imagem (padrão):
```json
[
  {
    "question": "Texto da pergunta",
    "options": [
      "Opção 1",
      "Opção 2",
      "Opção 3",
      "Opção 4",
      "Opção 5"
    ],
    "correctIndex": 2,
    "explanation": "Explicação da resposta correta",
    "type": "conteudista"
  },
  ...
]
```

#### Questão com imagem (opcional):
```json
[
  {
    "question": "Analise o ECG abaixo. Qual o diagnóstico?",
    "image": "subjects/CardioPneumo/CardioPneumoImages/ekg1.jpg",
    "options": [
      "Fibrilação atrial",
      "Flutter atrial",
      "Taquicardia sinusal",
      "Bloqueio AV de 2º grau"
    ],
    "correctIndex": 0,
    "explanation": "O ECG mostra ondas f irregulares características de fibrilação atrial.",
    "type": "raciocínio"
  },
  ...
]
```

Onde:
- `question`: Texto da pergunta
- `image`: **(OPCIONAL)** Caminho relativo para a imagem da questão. Se omitido, a questão será exibida sem imagem.
- `options`: Array com as alternativas
- `correctIndex`: Índice da alternativa correta (começando em 0)
- `explanation`: Explicação da resposta
- `type`: Tipo da questão ("conteudista" ou "raciocínio")

**Nota importante sobre imagens:**
- O campo `image` é completamente opcional - não é necessário incluí-lo se a questão não tiver imagem
- Imagens devem estar na pasta `subjects/[Especialidade]/[Especialidade]Images/`
- Formatos suportados: JPG, PNG, GIF
- As imagens são hospedadas no próprio GitHub Pages

### 3. Adicionando Imagens às Questões

Para adicionar imagens às questões (ex: ECGs, radiografias, gráficos):

1. Coloque a imagem na pasta da especialidade:
   - GO: `subjects/GO/GOImages/`
   - CardioPneumo: `subjects/CardioPneumo/CardioPneumoImages/`

2. No arquivo JSON, adicione o campo `image` com o caminho relativo:
   ```json
   {
     "question": "Analise a imagem. Qual o diagnóstico?",
     "image": "subjects/CardioPneumo/CardioPneumoImages/nome_da_imagem.jpg",
     "options": ["...", "...", "...", "..."],
     "correctIndex": 0,
     "explanation": "...",
     "type": "raciocínio"
   }
   ```

3. **Importante:** O campo `image` é opcional. Se omitido, a questão funcionará normalmente sem imagem.

### 4. Adicionando Novos Módulos

1. Crie um novo arquivo JSON com suas questões na pasta apropriada (ex: `subjects/GO/GOQuestions/novo_modulo.json`)
2. Adicione o módulo na configuração em `js/config.js` dentro da especialidade correspondente:

```javascript
specialties: {
    go: {
        // ... configurações existentes
        modules: [
            // Módulos existentes...
            {
                id: "novo_modulo",
                name: "Nome do Novo Módulo",
                file: "subjects/GO/GOQuestions/novo_modulo"
            }
        ]
    }
}
```

## Hospedagem no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos do template
3. Ative o GitHub Pages nas configurações do repositório
4. Seu quiz estará disponível em `https://seu-usuario.github.io/nome-do-repositorio/`

## Personalização Avançada

- **Cores**: Edite o arquivo CSS para alterar as cores do quiz
- **Funcionalidades**: Modifique os arquivos JS para adicionar novas funcionalidades

## Limitações

- O template não inclui funcionalidade de revisão espaçada
- A troca de arquivos JSON deve ser feita manualmente no código
