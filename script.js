// ===== CLASSE PRINCIPAL DE VALIDAÇÃO =====
class FormValidator {
    constructor() {
        this.form = document.getElementById('cadastroForm');
        this.initializeEventListeners();
        this.setupMasks();
        this.setupUppercaseConversion();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.form.addEventListener('input', (e) => this.validateField(e.target));
        this.form.addEventListener('blur', (e) => this.validateField(e.target), true);
    }

    setupMasks() {
        document.getElementById('cpf').addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                e.target.value = value;
            }
        });

        const telefoneInputs = document.querySelectorAll('input[type="tel"]');
        telefoneInputs.forEach(input => {
            input.addEventListener('input', function (e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    if (value.length <= 10) {
                        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    } else {
                        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    }
                    e.target.value = value;
                }
            });
        });
    }

    setupUppercaseConversion() {
        const fieldsToUppercase = this.form.querySelectorAll(
            'input:not([type="email"]):not([type="radio"]):not([type="checkbox"]):not([type="date"]), textarea'
        );
        fieldsToUppercase.forEach(field => {
            field.addEventListener('input', function () {
                // Não converte email para maiúscula em tempo real
                if (field.type !== 'email') {
                    this.value = this.value.toUpperCase();
                }
            });
        });
    }

    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        const errorElement = document.getElementById(`${fieldName}-error`);
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'nomeCompleto':
                if (!value) {
                    errorMessage = 'Nome completo é obrigatório';
                    isValid = false;
                } else if (value.length < 3) {
                    errorMessage = 'Nome deve ter pelo menos 3 caracteres';
                    isValid = false;
                } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value)) {
                    errorMessage = 'Nome deve conter apenas letras e espaços';
                    isValid = false;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    errorMessage = 'E-mail é obrigatório';
                    isValid = false;
                } else if (!emailRegex.test(value)) {
                    errorMessage = 'E-mail inválido';
                    isValid = false;
                }
                break;

            case 'cpf':
                if (!value) {
                    errorMessage = 'CPF é obrigatório';
                    isValid = false;
                } else if (!this.validateCPF(value)) {
                    errorMessage = 'CPF inválido';
                    isValid = false;
                }
                break;

            case 'dataNascimento':
                if (!value) {
                    errorMessage = 'Data de nascimento é obrigatória';
                    isValid = false;
                } else {
                    const birthDate = new Date(value);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    if (age < 16 || age > 100) {
                        errorMessage = 'Idade deve estar entre 16 e 100 anos';
                        isValid = false;
                    }
                }
                break;

            case 'telefone':
            case 'telefoneEmpresa':
                if (fieldName === 'telefone' && !value) {
                    errorMessage = 'Telefone é obrigatório';
                    isValid = false;
                } else if (value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
                    errorMessage = 'Formato inválido. Use: (99) 91234-5678';
                    isValid = false;
                }
                break;

            case 'razaoSocial':
            case 'cargo':
            case 'funcao':
            case 'numeroRegistro':
            case 'tipoRegistro':
                if (!value) {
                    errorMessage = 'Este campo é obrigatório';
                    isValid = false;
                }
                break;
        }

        if (fieldName === 'rtPrincipal') {
            const radioButtons = document.querySelectorAll('input[name="rtPrincipal"]');
            const isChecked = Array.from(radioButtons).some(radio => radio.checked);
            if (!isChecked) {
                errorMessage = 'Selecione uma opção';
                isValid = false;
            }
        }

        if (errorElement) {
            if (isValid) {
                errorElement.style.display = 'none';
                field.classList.remove('invalid');
                field.classList.add('valid');
            } else {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
                field.classList.remove('valid');
                field.classList.add('invalid');
            }
        }

        return isValid;
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
        let digit1 = 11 - (sum % 11);
        if (digit1 > 9) digit1 = 0;

        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
        let digit2 = 11 - (sum % 11);
        if (digit2 > 9) digit2 = 0;

        return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    }

    validateForm() {
        const fields = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isFormValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        const rtRadios = document.querySelectorAll('input[name="rtPrincipal"]');
        const rtChecked = Array.from(rtRadios).some(radio => radio.checked);
        if (!rtChecked) {
            document.getElementById('rtPrincipal-error').textContent = 'Selecione uma opção';
            document.getElementById('rtPrincipal-error').style.display = 'block';
            isFormValid = false;
        } else {
            document.getElementById('rtPrincipal-error').style.display = 'none';
        }

        const atividades = document.querySelectorAll('input[name="atividades"]:checked');
        if (atividades.length === 0) {
            document.getElementById('atividades-error').textContent = 'Selecione pelo menos uma atividade';
            document.getElementById('atividades-error').style.display = 'block';
            isFormValid = false;
        } else {
            document.getElementById('atividades-error').style.display = 'none';
        }

        return isFormValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        const isValid = this.validateForm();
        if (isValid) {
            // Aqui você pode implementar o envio do formulário se necessário
            console.log('Formulário válido - pronto para envio');
        } else {
            const firstError = this.form.querySelector('.invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

// ===== CLASSE DE GERAÇÃO DE EXCEL =====
class ExcelExporter {
    constructor() {
        this.formData = {};
    }

    collectFormData() {
        const form = document.getElementById('cadastroForm');
        
        // Coleta dados do formulário
        this.formData = {
            'Nome Completo': this.formatValue(form.nomeCompleto.value, 'text'),
            'E-mail': form.email.value.trim() || ' ', // Email mantém caixa original, espaço se vazio
            'CPF': this.formatValue(form.cpf.value, 'text'),
            'RG': this.formatValue(form.rg.value, 'text'),
            'Data de Nascimento': this.formatValue(form.dataNascimento.value, 'date'),
            'Telefone': this.formatValue(form.telefone.value, 'text'),
            'Endereço Residencial': this.formatValue(form.endereco.value, 'text'),
            'Razão Social': this.formatValue(form.razaoSocial.value, 'text'),
            'Telefone da Empresa': this.formatValue(form.telefoneEmpresa.value, 'text'),
            'Endereço da Empresa': this.formatValue(form.enderecoEmpresa.value, 'text'),
            'Cargo': this.formatValue(form.cargo.value, 'text'),
            'Função': this.formatValue(form.funcao.value, 'text'),
            'Matrícula': this.formatValue(form.matricula.value, 'text'),
            'Tipo de Registro': this.formatValue(form.tipoRegistro.value, 'text'),
            'Número de Registro': this.formatValue(form.numeroRegistro.value, 'text'),
            'RT Principal': this.getRTPrincipal(),
            'Atividades': this.getAtividades()
        };
    }

    formatValue(value, type) {
        if (!value || value.trim() === '') return ' '; // Retorna espaço em branco se vazio
        
        // Para campos de texto, converte para maiúscula
        if (type === 'text') {
            return value.trim().toUpperCase();
        }
        
        // Para campos de data, converte para formato brasileiro
        if (type === 'date') {
            return this.formatDateToBrazilian(value);
        }
        
        return value.trim();
    }

    formatDateToBrazilian(dateValue) {
        if (!dateValue) return ' ';
        
        try {
            // O input date retorna no formato YYYY-MM-DD
            const [year, month, day] = dateValue.split('-');
            return `${day}/${month}/${year}`;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateValue; // Retorna o valor original se houver erro
        }
    }

    getRTPrincipal() {
        const rtRadio = document.querySelector('input[name="rtPrincipal"]:checked');
        if (rtRadio) {
            return rtRadio.value === 'sim' ? 'SIM' : 'NÃO';
        }
        return ' '; // Retorna espaço em branco se não selecionado
    }

    getAtividades() {
        const atividades = document.querySelectorAll('input[name="atividades"]:checked');
        if (atividades.length === 0) return ' '; // Retorna espaço em branco se nenhuma atividade selecionada
        
        const atividadesTexto = {
            'calculo': 'LANÇAR/EDITAR MEMÓRIA DE CÁLCULO/MEDIÇÃO',
            'diario': 'LANÇAR/EDITAR DIÁRIO DE OBRA',
            'leitura': 'SOMENTE LEITURA E ACOMPANHAMENTO DE INFORMAÇÕES'
        };
        
        return Array.from(atividades)
            .map(cb => atividadesTexto[cb.value] || cb.value.toUpperCase())
            .join('; ');
    }

    // Remove a função escapeCSVValue pois não é mais necessária para Excel

    generateExcelContent() {
        const headers = Object.keys(this.formData);
        const values = Object.values(this.formData);
        
        // Dados para a planilha
        const worksheetData = [
            headers, // Linha de cabeçalho
            values   // Linha de dados
        ];
        
        return worksheetData;
    }

    downloadExcel() {
        // Primeiro valida o formulário
        const validator = new FormValidator();
        if (!validator.validateForm()) {
            alert('Por favor, corrija os erros no formulário antes de gerar o Excel.');
            return;
        }

        // Mostra loading
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }

        // Simula processamento
        setTimeout(() => {
            try {
                this.collectFormData();
                const worksheetData = this.generateExcelContent();
                
                // Cria um novo workbook
                const wb = XLSX.utils.book_new();
                
                // Cria a worksheet com os dados
                const ws = XLSX.utils.aoa_to_sheet(worksheetData);
                
                // Define larguras das colunas
                const colWidths = Object.keys(this.formData).map(header => ({
                    wch: Math.max(header.length, 20) // Mínimo 20 caracteres
                }));
                ws['!cols'] = colWidths;
                
                // Estiliza o cabeçalho (primeira linha)
                const headerRange = XLSX.utils.decode_range(ws['!ref']);
                for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                    if (!ws[cellAddress]) continue;
                    
                    // Aplica formatação ao cabeçalho
                    ws[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "2980B9" } },
                        alignment: { horizontal: "center", vertical: "center" }
                    };
                }
                
                // Adiciona a worksheet ao workbook
                XLSX.utils.book_append_sheet(wb, ws, "Cadastro de Usuário");
                
                // Gera o arquivo Excel
                const fileName = `cadastro_usuario_${this.getFormattedDateTime()}.xlsx`;
                XLSX.writeFile(wb, fileName);
                
                // Mostra mensagem de sucesso
                this.showSuccessMessage();
                
            } catch (error) {
                console.error('Erro ao gerar Excel:', error);
                alert('Erro ao gerar o arquivo Excel. Verifique se a biblioteca SheetJS está carregada.');
            } finally {
                // Esconde loading
                if (loading) {
                    loading.style.display = 'none';
                }
            }
        }, 500);
    }

    showSuccessMessage() {
        const successBanner = document.getElementById('successBanner');
        if (successBanner) {
            successBanner.textContent = '✅ Arquivo Excel gerado com sucesso!';
            successBanner.style.display = 'block';
            
            // Esconde a mensagem após 3 segundos
            setTimeout(() => {
                successBanner.style.display = 'none';
            }, 3000);
        }
    }

    getFormattedDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}${month}${day}_${hour}${minute}`;
    }
}

// ===== FUNÇÕES GLOBAIS =====
function CSVGenerator() {
    const exporter = new ExcelExporter();
    exporter.downloadExcel();
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o validador de formulário
    new FormValidator();
    
    // Adiciona evento ao botão de reset
    const resetButton = document.querySelector('button[type="reset"]');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Limpa todas as mensagens de erro e classes de validação
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.style.display = 'none');
            
            const fields = document.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                field.classList.remove('valid', 'invalid');
            });
            
            // Esconde mensagem de sucesso
            const successBanner = document.getElementById('successBanner');
            if (successBanner) {
                successBanner.style.display = 'none';
            }
        });
    }
});