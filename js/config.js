/**
 * config.js - Configurações do quiz
 * 
 * Este arquivo contém as configurações personalizáveis do quiz.
 * Altere estas configurações para adaptar o quiz à sua matéria.
 */

// Configuração do quiz
const quizConfig = {
    // Título principal que aparece na tela de login. Ajuste conforme a sua disciplina.
    title: "Quizzes",

    // Nome do localStorage para salvar os dados do usuário. Alterado para evitar conflitos com o template original.
    storageKey: "quizMedicoData",

    // Especialidades disponíveis
    specialties: {
        go: {
            id: "go",
            name: "Ginecologia e Obstetrícia",
            hasResumos: true,
            hasGuias: true,
            hasSubcategories: true,
            subcategories: {
                avc1: {
                    id: "avc1",
                    name: "AVC 1",
                    modules: [
                        {
                            id: "exame_ginecologico",
                            name: "Exame Ginecológico",
                            file: "subjects/GO/AVC 1/GOQuestions/exame_ginecologico"
                        },
                        {
                            id: "ciclo_menstrual",
                            name: "Ciclo Menstrual",
                            file: "subjects/GO/AVC 1/GOQuestions/ciclo_menstrual"
                        },
                        {
                            id: "desenvolvimento_puberal",
                            name: "Desenvolvimento Puberal",
                            file: "subjects/GO/AVC 1/GOQuestions/desenvolvimento_puberal"
                        },
                        {
                            id: "embriologia",
                            name: "Embriologia",
                            file: "subjects/GO/AVC 1/GOQuestions/embrio"
                        },
                        {
                            id: "embriologia_avancada",
                            name: "Embriologia Avançada",
                            file: "subjects/GO/AVC 1/GOQuestions/embrio2"
                        },
                        {
                            id: "anatomia",
                            name: "Anatomia",
                            file: "subjects/GO/AVC 1/GOQuestions/anatomia"
                        }
                    ]
                },
                avc2: {
                    id: "avc2",
                    name: "AVC 2",
                    modules: [
                        {
                            id: "citologia_oncotica",
                            name: "Citologia Oncótica",
                            file: "subjects/GO/AVC 2/GOQuestions/1citologia-oncotica"
                        },
                        {
                            id: "puerperio_amamentacao",
                            name: "Puerpério e Amamentação",
                            file: "subjects/GO/AVC 2/GOQuestions/2puerperio_amamentacao_questoes"
                        },
                        {
                            id: "vulvovaginites",
                            name: "Vulvovaginites",
                            file: "subjects/GO/AVC 2/GOQuestions/3vulvovaginites"
                        },
                        {
                            id: "ists_dipa",
                            name: "ISTs e DIPA",
                            file: "subjects/GO/AVC 2/GOQuestions/4istsdipa"
                        },
                        {
                            id: "patologias_tgi",
                            name: "Patologias TGI",
                            file: "subjects/GO/AVC 2/GOQuestions/5patologiastgi"
                        },
                        {
                            id: "trabalho_parto",
                            name: "Trabalho de Parto e Parto",
                            file: "subjects/GO/AVC 2/GOQuestions/6trabalhodepartoeparto"
                        },
                        {
                            id: "revisao_geral_parte1",
                            name: "Revisão Geral - Parte 1",
                            file: "subjects/GO/AVC 2/GOQuestions/revisao-geral-parte"
                        },
                        {
                            id: "revisao_geral_parte2",
                            name: "Revisão Geral - Parte 2",
                            file: "subjects/GO/AVC 2/GOQuestions/revisao-geral-parte2"
                        }
                    ]
                }
            }
        },
        cardio: {
            id: "cardio",
            name: "Cardiologia e Pneumologia",
            hasResumos: false,
            hasGuias: false,
            hasSubcategories: true,
            subcategories: {
                avc1: {
                    id: "avc1",
                    name: "AVC 1",
                    modules: [
                        {
                            id: "has",
                            name: "Hipertensão Arterial Sistêmica",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/has"
                        },
                        {
                            id: "dislipidemias",
                            name: "Dislipidemias",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/dislipidemias"
                        },
                        {
                            id: "sca",
                            name: "Síndrome Coronariana Aguda",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/SCA"
                        },
                        {
                            id: "ic",
                            name: "Insuficiência Cardíaca",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/IC"
                        },
                        {
                            id: "propedeutica",
                            name: "Propedêutica",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/propedeutica"
                        },
                        {
                            id: "bronquite",
                            name: "Bronquite",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/bronquite"
                        },
                        {
                            id: "enfisema",
                            name: "Enfisema",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/enfisema"
                        },
                        {
                            id: "diagnostico_dpoc",
                            name: "Diagnóstico DPOC",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/diagnostico_dpoc"
                        },
                        {
                            id: "tratamento_dpoc",
                            name: "Tratamento DPOC",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 1/tratamento_dpoc"
                        }
                    ]
                },
                avc2: {
                    id: "avc2",
                    name: "AVC 2",
                    modules: [
                        {
                            id: "ecg",
                            name: "ECG",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/ECG"
                        },
                        {
                            id: "asma",
                            name: "Asma",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/asma"
                        },
                        {
                            id: "dengue",
                            name: "Dengue",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/dengue"
                        },
                        {
                            id: "hipertireoidismo",
                            name: "Hipertireoidismo",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/hipertireoidismo"
                        },
                        {
                            id: "lrarenal",
                            name: "Lesão Renal Aguda",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/lrarenal"
                        },
                        {
                            id: "miocardiopatias",
                            name: "Miocardiopatias",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/miocardiopatias"
                        },
                        {
                            id: "pneumonias",
                            name: "Pneumonias",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/pneumonias"
                        },
                        {
                            id: "sdnefritica",
                            name: "Síndrome Nefrítica",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/sdnefritica"
                        },
                        {
                            id: "valvulopatias",
                            name: "Valvulopatias",
                            file: "subjects/CardioPneumo/CardioPneumoQuestions/AVC 2/valvulopatias"
                        }
                    ]
                }
            }
        },
        clinica: {
            id: "clinica",
            name: "Clínica Cirúrgica",
            hasResumos: true,
            hasGuias: true,
            hasSubcategories: true,
            subcategories: {
                avc1: {
                    id: "avc1",
                    name: "AVC 1",
                    modules: [
                        {
                            id: "pneumotorax",
                            name: "Pneumotórax",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/1pneumotorax"
                        },
                        {
                            id: "disturbioscoagulacao",
                            name: "Distúrbios da Coagulação",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/2disturbioscoagulacao"
                        },
                        {
                            id: "pediabetico",
                            name: "Pé Diabético",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/3pediabetico"
                        },
                        {
                            id: "ureterolitiase",
                            name: "Ureterolitíase e Pielonefrite",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/4ureterolitiaseepielonefrite"
                        },
                        {
                            id: "noduloscervicais",
                            name: "Nódulos Cervicais",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/5noduloscervicais"
                        },
                        {
                            id: "insuficienciavenosa",
                            name: "Insuficiência Venosa",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/6insuficienciavenosa"
                        },
                        {
                            id: "acessos_vasculares",
                            name: "Acessos Vasculares",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/7questoes_acessos_vasculares"
                        },
                        {
                            id: "tvp",
                            name: "TVP - Trombose Venosa Profunda",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/8tvp"
                        },
                        {
                            id: "derramepleural",
                            name: "Derrame Pleural",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/9derramepleural"
                        },
                        {
                            id: "edemas",
                            name: "Edemas",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/10edemas"
                        },
                        {
                            id: "celulite",
                            name: "Celulite e Erisipela",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/11celuliteeerisipela"
                        },
                        {
                            id: "emboliapulmonar",
                            name: "Embolia Pulmonar",
                            file: "subjects/ClinicaCirurgica/ClinicaCirurgicaQuestions/AVC 1/12emboliapulmonar"
                        }
                    ]
                }
            }
        },
        ped: {
            id: "ped",
            name: "Pediatria",
            hasResumos: false,
            hasGuias: false,
            hasSubcategories: true,
            subcategories: {
                avc1: {
                    id: "avc1",
                    name: "AVC 1",
                    modules: [
                        {
                            id: "prenatal_eca",
                            name: "Pré-Natal e ECA",
                            file: "subjects/Ped/AVC 1/PedQuestions/PreNatal+ECA"
                        },
                        {
                            id: "aleitamento",
                            name: "Aleitamento Materno",
                            file: "subjects/Ped/AVC 1/PedQuestions/questoes-aleitamento-corrigidas"
                        },
                        {
                            id: "crescimento",
                            name: "Crescimento e Antropometria + DPNM",
                            file: "subjects/Ped/AVC 1/PedQuestions/Crescimento_Antropometria+DPNM"
                        },
                        {
                            id: "imunizacao",
                            name: "Imunização",
                            file: "subjects/Ped/AVC 1/PedQuestions/imunizacao"
                        },
                        {
                            id: "ecopediatria",
                            name: "Ecopediatria e Prevenção de Acidentes",
                            file: "subjects/Ped/AVC 1/PedQuestions/questoes-ecopediatria-prevencao-acidentes-corrigidas"
                        },
                        {
                            id: "saude_digital",
                            name: "Saúde Digital e Telas",
                            file: "subjects/Ped/AVC 1/PedQuestions/saudedigital_telas"
                        }
                    ]
                }
            }
        },
        ligaCardio: {
            id: "ligaCardio",
            name: "Liga de Cardiologia",
            hasResumos: false,
            hasGuias: false,
            modules: [
                {
                    id: "sca",
                    name: "Síndrome Coronariana Aguda",
                    file: "subjects/ligaCardio/ligaCardioQuestions/SCA"
                },
                {
                    id: "cardiometabolismo",
                    name: "Cardiometabolismo",
                    file: "subjects/ligaCardio/ligaCardioQuestions/cardiometabolismo"
                },
                {
                    id: "taquiarritmias",
                    name: "Taquiarritmias",
                    file: "subjects/ligaCardio/ligaCardioQuestions/taqui"
                }
            ]
        },
        tc: {
            id: "tc",
            name: "Técnicas Cirúrgicas",
            hasResumos: true,
            hasGuias: true,
            modules: [
                {
                    id: "cicatrizacao",
                    name: "Cicatrização",
                    file: "subjects/TecnicasCirurgicas/TCQuestions/questoes_cicatrizacao"
                },
                {
                    id: "cicatrizacao_patologica",
                    name: "Cicatrização Patológica",
                    file: "subjects/TecnicasCirurgicas/TCQuestions/questoes_cicatrizacao_patologica"
                },
                {
                    id: "coagulacao",
                    name: "Coagulação",
                    file: "subjects/TecnicasCirurgicas/TCQuestions/questoes_coagulacao"
                },
                {
                    id: "preoperatorio",
                    name: "Pré-operatório",
                    file: "subjects/TecnicasCirurgicas/TCQuestions/questoes_preoperatorio"
                }
            ]
        }
    },

    // Lista de módulos disponíveis (mantida para compatibilidade)
    modules: []
};
