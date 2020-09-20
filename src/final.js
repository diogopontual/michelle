const fs = require("fs");
const accents = require('remove-accents');
const { Client } = require("@elastic/elasticsearch");
const client = new Client({ node: "http://elastic:senhadoelastic@bart.diogopontual.com.br:9200" });
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let output = [];
const cnpjSituacoes = {
    '01': 'NULA',
    '02': 'ATIVA',
    '03': 'SUSPENSA',
    '04': 'INAPTA',
    '08': 'BAIXADA',
}

const cnpjPortes = {
    '00': 'NAO INFORMADO',
    '01': 'MICRO EMPRESA',
    '03': 'EMPRESA DE PEQUENO PORTE',
    '05': 'DEMAIS'
}
const csvWriter = createCsvWriter({
    path: '../data/out.csv',
    header: [
        { id: 'hrName', title: 'Human Rights - Nome' },
        { id: 'hrCountry', title: 'Human Rights - País' },
        { id: 'hrGroup', title: 'Human Rights - Grupo' },
        { id: 'cnpjNomeFantasia', title: 'CNPJ - Nome Fantasia' },
        { id: 'cnpjNomeEmpresarial', title: 'CNPJ - Nome Empresarial' },
        { id: 'cnpjCnpj', title: 'CNPJ - CNPJ' },
        { id: 'cnpjPorte', title: 'CNPJ - Porte' },
        { id: 'cnpjCapital', title: 'CNPJ - Capital' },
        { id: 'cnpjSituacao', title: 'CNPJ - Situação' },
        { id: 'cnpjTelefone', title: 'CNPJ - Telefone' },
        { id: 'cnpjEmail', title: 'CNPJ - Email' },
        { id: 'cnpjSituacao', title: 'CNPJ - Situação' },
        { id: 'cnpjCNAE', title: 'CNPJ - CNAE' },
        { id: 'cnpjUF', title: 'CNPJ - UF' },
        { id: 'cnpjMunicipio', title: 'CNPJ - Municipio' },
        { id: 'imName', title: 'Investment - Name' },
        { id: 'imHostCountry', title: 'Investment - Host Coyntry' },
        { id: 'imParentCompany', title: 'Investment - Parent Company' },
        { id: 'imParentCountry', title: 'Investment - Parent Country' },
        { id: 'imAnnualSales', title: 'Investment - Annual Sales' },
        { id: 'imNumberOfEmployees', title: 'Investment - Number of Emplyees' },
        { id: 'classification', title: 'Classificação' }
    ]
});

let classify = function (company, cnpj, investment) {
    let palavrasComuns = ['group']
    let cn = accents.remove(company.name).toLowerCase().replace('\'', '').replace(/\"/g, '').replace('`', '').trim();
    let cnf = accents.remove(cnpj.nomeFantasia).toLowerCase().replace('\'', '').replace('"', '').replace('`', '').trim();
    let inn = accents.remove(investment.NAME).toLowerCase().replace('\'', '').replace('"', '').replace('`', '').trim();

    let classif = 'RUIM'
    if (cnf.indexOf(cn) >= 0 && inn.indexOf(cn) >= 0) {
        let s = cn.split(' ');
        let maiorPalavra = s.reduce((r, el) => Math.max(r, el.length), 0)
        let texto = s.reduce((r, el) => r || isNaN(el), false)
        let temPalavrasComuns = s.reduce((r, el) => r || el.indexOf(palavrasComuns) >= 0, false)
        if (s.length > 2) {
            classif = "OTIMA";
        } else if (s.length > 1 && maiorPalavra) {
            classif = "BOA";
        } else {
            if (texto && !temPalavrasComuns)
                classif = "REGULAR"
        }
    }
    if (company.country != 'desconhecido') {
        let cc = accents.remove(company.country.toLowerCase()).trim();
        let ihc = accents.remove(investment.HOST_COUNTRY.toLowerCase()).trim();
        let ipc = accents.remove(investment.PARENT_COUNTRY.toLowerCase()).trim();
        if ((cc != ihc) && (cc != ipc)) {
            throw new Error("Países incompatíveis");
        }
    }
    return classif;
};

(async function () {
    let txt = fs.readFileSync('../data/todas.txt', 'utf8');
    let lines = txt.split('\n');
    let tested = 0;
    for (let i = 0; i < lines.length; i++) {
        tested++;
        let line = lines[i];
        let columns = line.split('||');
        let parent = /.*\(part of (.*)\).*/ig.exec(accents.remove(columns[0]));
        let company = {
            originalName: columns[0],
            parent: (parent ? parent[1] : null),
            name: accents.remove(columns[0]).replace(/\(.*\)/g, "").trim(),
            country: columns[1]
        };
        let cnpj = await searchCNPJ(company.name)
        if (cnpj) {
            if ((cnpj.uf == 'EX' || company.country == 'Brazil')) {
                let investment = await searchInvestmentMap(company.name, company.parent);
                if (investment) {
                    let classification = null;
                    try {
                        classification = classify(company, cnpj, investment);
                    } catch (err) {
                        continue
                    }
                    output.push({
                        hrName: company.originalName,
                        hrCountry: company.country,
                        hrGroup: company.parent,
                        cnpjNomeFantasia: cnpj.nomeFantasia,
                        cnpjNomeEmpresarial: cnpj.nomeEmpresarial,
                        cnpjCnpj: cnpj.cnpj,
                        cnpjPorte: cnpjPortes[cnpj.porte],
                        cnpjCapital: cnpj.capital,
                        cnpjSituacao: cnpjSituacoes[cnpj.situacao],
                        cnpjTelefone: cnpj.telefone1,
                        cnpjEmail: cnpj.email,
                        cnpjCNAE: cnpj.cnae,
                        cnpjUF: cnpj.uf,
                        cnpjMunicipio: cnpj.municipio,
                        imName: investment.NAME,
                        imHostCountry: investment.HOST_COUNTRY,
                        imParentCompany: investment.LEADING_PARENT_COMPANY,
                        imParentCountry: investment.PARENT_COUNTRY,
                        imAnnualSales: investment.ANNUAL_SALES,
                        imNumberOfEmployees: investment.NUMBER_OF_EMPLOYEES,
                        classification: classification
                    });
                    process.stdout.write(`total: ${tested} | found: ${output.length}\r`);
                    // if(output.length > 200){
                    //     break;
                    // }

                }
            }
        }

    }
    csvWriter.writeRecords(output).then(() => console.log(`The CSV file was written successfully with ${output.length} companies.`));
})()

async function searchCNPJ(name) {
    const { body } = await client.search({
        index: 'cnpj',
        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "nomeFantasia": {
                                    "query": name,
                                    "minimum_should_match": "100%"
                                }
                            }
                        },
                        {
                            "match": {
                                "situacao": {
                                    "query": '02'
                                }
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "match": {
                                "porte": '01'
                            }
                        },
                        {
                            "match": {
                                "porte": '03'
                            }
                        }
                    ],
                    "should": [
                        {
                            "match": {
                                "uf.keyword": "EX"
                            }
                        }
                    ]
                }
            }
        }
    })
    if (body.hits.hits.length > 0) {
        return body.hits.hits[0]._source;
    } else {
        return null;
    }
}

async function searchInvestmentMap(companyName, parent) {
    const { body } = await client.search({
        index: 'investmentmap*',
        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "bool": {
                                "should": [
                                    {
                                        "match": {
                                            "LEADING_PARENT_COMPANY": {
                                                "query": companyName,
                                                "minimum_should_match": "100%"
                                            }
                                        }
                                    },
                                    {
                                        "match": {
                                            "NAME": {
                                                "query": companyName,
                                                "minimum_should_match": "100%"
                                            }
                                        }
                                    },
                                    {
                                        "match": {
                                            "LEADING_PARENT_COMPANY": {
                                                "query": parent || "",
                                                "minimum_should_match": "100%"
                                            }
                                        }
                                    },
                                    {
                                        "match": {
                                            "NAME": {
                                                "query": parent || "",
                                                "minimum_should_match": "100%"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }
    })
    if (body.hits.hits.length > 0) {
        return body.hits.hits[0]._source;
    } else {
        return null;
    }
}

