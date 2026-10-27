/**
 * Script para substituir cores verdes por azul #148040 em toda a extensão
 */

(function() {
  console.log("Script de correção de cores iniciado");
  
  // Cor azul principal e suas variantes
  const PRIMARY_COLOR = '#148040';
  const PRIMARY_HOVER = '#333385';
  const PRIMARY_ACTIVE = '#28276E';
  
  // Lista de cores verdes comuns que devem ser substituídas
  const greenColors = [
    '#52c41a', // Verde padrão do Ant Design
    '#1DA57A', // Verde escuro usado em alguns temas
    '#73d13d', // Verde claro Ant Design
    '#95de64', // Verde mais claro Ant Design
    '#389e0d', // Verde mais escuro Ant Design
    '#237804', // Verde muito escuro
    '#135200', // Verde extremamente escuro
    '#f6ffed', // Verde muito claro de fundo
    '#d9f7be', // Verde claro de fundo
    '#b7eb8f', // Verde médio de fundo
    '#a9d134', // Outros tons de verde que podem aparecer
    '#7cb305',
    '#5b8c00',
    '#08979c', // Verde-azulado
    '#13c2c2', // Verde-azulado mais claro
    '#006d75'  // Verde-azulado mais escuro
  ];
  
  // Mapeamento de cores verdes para tons de azul
  const colorMapping = {};
  
  // Configurar mapeamento de cores
  greenColors.forEach(greenColor => {
    // Para cores mais claras, usar tons mais claros de azul
    if (greenColor.includes('f') || greenColor.includes('e') || greenColor.includes('d')) {
      colorMapping[greenColor] = '#DEDDF5'; // Azul muito claro
    } 
    // Para cores médias, usar o tom principal
    else if (greenColor.includes('c') || greenColor.includes('b') || greenColor.includes('a')) {
      colorMapping[greenColor] = PRIMARY_COLOR;
    }
    // Para cores escuras, usar tons mais escuros
    else {
      colorMapping[greenColor] = PRIMARY_ACTIVE;
    }
  });
  
  // Função para substituir cores em estilos inline
  function replaceInlineStyles() {
    // Selecionar todos os elementos com style inline
    const elementsWithStyle = document.querySelectorAll('[style*="color"]');
    
    elementsWithStyle.forEach(element => {
      const style = element.getAttribute('style');
      
      // Verificar cada cor verde conhecida
      greenColors.forEach(greenColor => {
        if (style && style.includes(greenColor)) {
          // Substituir a cor verde pela cor azul correspondente
          const newStyle = style.replace(new RegExp(greenColor, 'g'), colorMapping[greenColor]);
          element.setAttribute('style', newStyle);
          console.log(`Cor substituída em elemento inline: ${greenColor} -> ${colorMapping[greenColor]}`);
        }
      });
    });
  }
  
  // Função para substituir cores em classes CSS
  function replaceCSSColors() {
    // Obter todas as folhas de estilo
    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach(sheet => {
      try {
        // Pular folhas de estilo de outros domínios (CORS)
        if (!sheet.href || sheet.href.startsWith(window.location.origin) || sheet.href.startsWith('blob:')) {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          
          rules.forEach(rule => {
            if (rule.style) {
              // Propriedades de cor que podem conter verde
              const colorProps = [
                'color', 'background-color', 'border-color', 
                'background', 'border', 'box-shadow',
                'text-shadow'
              ];
              
              colorProps.forEach(prop => {
                const value = rule.style.getPropertyValue(prop);
                
                if (value) {
                  greenColors.forEach(greenColor => {
                    if (value.includes(greenColor)) {
                      // Substituir a cor verde pela cor azul correspondente
                      const newValue = value.replace(new RegExp(greenColor, 'g'), colorMapping[greenColor]);
                      rule.style.setProperty(prop, newValue, rule.style.getPropertyPriority(prop));
                      console.log(`Cor substituída em CSS: ${greenColor} -> ${colorMapping[greenColor]}`);
                    }
                  });
                }
              });
            }
          });
        }
      } catch (e) {
        // Tratar erros de CORS
        console.log("Não foi possível acessar folha de estilo (possível erro de CORS):", e);
      }
    });
  }
  
  // Função para substituir cores nos SVGs
  function replaceSVGColors() {
    // Selecionar todos os elementos SVG
    const svgElements = document.querySelectorAll('svg');
    
    svgElements.forEach(svg => {
      // Elementos SVG que podem ter cores
      const coloredElements = svg.querySelectorAll('[fill], [stroke]');
      
      coloredElements.forEach(element => {
        // Verificar atributo fill
        const fill = element.getAttribute('fill');
        if (fill) {
          greenColors.forEach(greenColor => {
            if (fill === greenColor) {
              element.setAttribute('fill', colorMapping[greenColor]);
              console.log(`Cor fill em SVG substituída: ${greenColor} -> ${colorMapping[greenColor]}`);
            }
          });
        }
        
        // Verificar atributo stroke
        const stroke = element.getAttribute('stroke');
        if (stroke) {
          greenColors.forEach(greenColor => {
            if (stroke === greenColor) {
              element.setAttribute('stroke', colorMapping[greenColor]);
              console.log(`Cor stroke em SVG substituída: ${greenColor} -> ${colorMapping[greenColor]}`);
            }
          });
        }
      });
    });
  }
  
  // Adicionar CSS global para substituir cores
  function addGlobalCSS() {
    const style = document.createElement('style');
    
    let cssRules = '';
    
    // Criar regras para substituir cada cor verde
    greenColors.forEach(greenColor => {
      const blueColor = colorMapping[greenColor];
      
      cssRules += `
        [style*="${greenColor}"] {
          color: ${blueColor} !important;
        }
        
        [style*="background-color: ${greenColor}"] {
          background-color: ${blueColor} !important;
        }
        
        [style*="border-color: ${greenColor}"] {
          border-color: ${blueColor} !important;
        }
      `;
    });
    
    // Adicionar substituições específicas para Ant Design
    cssRules += `
      /* Botões primários Ant Design */
      .ant-btn-primary {
        background-color: ${PRIMARY_COLOR} !important;
        border-color: ${PRIMARY_COLOR} !important;
      }
      
      .ant-btn-primary:hover,
      .ant-btn-primary:focus {
        background-color: ${PRIMARY_HOVER} !important;
        border-color: ${PRIMARY_HOVER} !important;
      }
      
      /* Seletor específico para o badge na barra de navegação */
      #main_section .main_toolbar .left_tab-side .top-tabbar-badge-class {
        background-color: ${PRIMARY_COLOR} !important;
        color: white !important;
      }
      
      /* Elementos de UI comuns do Ant Design */
      .ant-checkbox-checked .ant-checkbox-inner,
      .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled),
      .ant-switch-checked,
      .ant-slider-track,
      .ant-select-focused .ant-select-selector,
      .ant-pagination-item-active,
      .ant-steps-item-finish .ant-steps-item-icon,
      .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon,
      .ant-progress-success-bg, 
      .ant-progress-bg {
        background-color: ${PRIMARY_COLOR} !important;
        border-color: ${PRIMARY_COLOR} !important;
      }
      
      /* Texto e ícones */
      .ant-checkbox-checked + span,
      .ant-radio-checked + span,
      .ant-calendar-selected-day .ant-calendar-date,
      .ant-steps-item-finish .ant-steps-item-icon,
      .ant-menu-submenu-selected,
      .ant-menu-item-selected,
      .ant-menu-item:hover,
      .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        color: ${PRIMARY_COLOR} !important;
      }
      
      /* Botões com fundo transparente */
      .ant-btn-link {
        color: ${PRIMARY_COLOR} !important;
      }
      
      /* Botões com fundo transparente - hover */
      .ant-btn-link:hover,
      .ant-btn-link:focus {
        color: ${PRIMARY_HOVER} !important;
      }
    `;
    
    style.textContent = cssRules;
    document.head.appendChild(style);
    console.log("CSS global para substituição de cores adicionado");
  }
  
  // Função principal que executa todas as substituições
  function replaceAllColors() {
    console.log("Substituindo cores verdes por azul...");
    
    // Adicionar CSS global
    addGlobalCSS();
    
    // Substituir cores em estilos inline
    replaceInlineStyles();
    
    // Substituir cores em SVGs
    replaceSVGColors();
    
    // Tentar substituir cores em folhas de estilo (pode não funcionar devido a CORS)
    try {
      replaceCSSColors();
    } catch (e) {
      console.log("Erro ao substituir cores em folhas de estilo:", e);
    }
    
    console.log("Substituição de cores concluída");
  }
  
  // Configurar para executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceAllColors);
  } else {
    replaceAllColors();
  }
  
  // Executar novamente após carregamento completo
  window.addEventListener('load', replaceAllColors);
  
  // Para elementos dinâmicos, executar periodicamente
  setInterval(replaceAllColors, 5000);
  
  // Observar mudanças no DOM para capturar elementos adicionados dinamicamente
  const observer = new MutationObserver((mutations) => {
    let shouldReplace = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        shouldReplace = true;
      }
    });
    
    if (shouldReplace) {
      replaceAllColors();
    }
  });
  
  // Iniciar observação
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log("Observador de mudanças no DOM configurado para substituição de cores");

  // Função para remover elementos indesejados
  function removeUnwantedElements() {
    // Criar um MutationObserver para observar mudanças no DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        // Remover link do WhatsApp
        const whatsappLink = document.getElementById('blkwhattsapplink');
        if (whatsappLink) {
          whatsappLink.remove();
        }

        try {
          // Remoção direta por posição no menu - foco nos itens 2 e 3
          const menuContainer = document.querySelector('.custom-setting-menu-items-layout');
          if (menuContainer) {
            const menuItems = menuContainer.querySelectorAll('.custom-setting-menu-item');
            
            // Verifica se o segundo item existe e remove "Gerenciar chave de licença"
            if (menuItems.length >= 2) {
              const licenseItem = menuItems[1]; // índice 1 = segundo item
              if (licenseItem) {
                console.log('Removendo item de licença (2º item)');
                licenseItem.remove();
              }
            }
            
            // Como removemos um item, o terceiro agora é o segundo
            const updatedMenuItems = menuContainer.querySelectorAll('.custom-setting-menu-item');
            // Verifica se o terceiro item existe e remove "Contate-nos"
            if (updatedMenuItems.length >= 2) {
              const contactItem = updatedMenuItems[1]; // índice 1 = segundo item (após remoção)
              if (contactItem) {
                console.log('Removendo item de contato (3º item original)');
                contactItem.remove();
              }
            }
          }
        } catch (error) {
          console.error('Erro ao remover itens específicos:', error);
        }

        // Lista de textos dos itens específicos que devem ser removidos
        const textsToRemove = [
          "Gerenciar chave de licença",
          "Contate-nos", 
          "Recurso de solicitação", 
          "Veja o tutorial", 
          "Política de Privacidade"
        ];
        
        // Lista de URLs específicas que devem ser removidas
        const urlsToRemove = [
          "https://lotsofcode.in/request-feature",
          "https://lotsofcode.in/tutorials",
          "https://lotsofcode.in/privacy-policy"
        ];

        // Remover itens de menu de configuração com base no texto
        const settingMenuItems = document.querySelectorAll('.custom-setting-menu-item');
        settingMenuItems.forEach((item) => {
          // Verificar o texto dentro do item para identificação precisa
          const itemText = item.textContent?.trim() || '';
          if (textsToRemove.some(text => itemText.includes(text))) {
            item.remove();
            return;
          }
          
          // Verificar se contém links específicos para lotsofcode.in
          const links = item.querySelectorAll('a');
          for (const link of links) {
            const href = link.getAttribute('href');
            if (href && urlsToRemove.some(url => href.includes(url))) {
              item.remove();
              return;
            }
          }
          
          // Verificações específicas para cada tipo de item
          
          // Verificar se é o item "Gerenciar chave de licença" - verificar SVG específico
          const licenseKey = item.querySelector('svg[viewBox="0 0 28 27"]');
          if (licenseKey && item.textContent?.includes("Gerenciar chave de licença")) {
            item.remove();
            return;
          }

          // Verificar se é o item "Contate-nos" - verificar SVG específico
          const contactUs = item.querySelector('svg[viewBox="0 0 30 31"]');
          if (contactUs && item.textContent?.includes("Contate-nos")) {
            item.remove();
            return;
          }
        });
      });
    });

    // Observar o documento para mudanças no DOM
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Função específica para remover o elemento "Contate-nos"
  function removeContactUs() {
    // Criar um observer dedicado para encontrar e remover o elemento "Contate-nos"
    const contactUsObserver = new MutationObserver(() => {
      // Localizando pelo SVG específico
      const contactUsSVGs = document.querySelectorAll('svg[viewBox="0 0 30 31"]');
      contactUsSVGs.forEach(svg => {
        const menuItem = svg.closest('.custom-setting-menu-item');
        if (menuItem) {
          // Verificar se contém o texto "Contate-nos"
          if (menuItem.textContent && menuItem.textContent.includes("Contate-nos")) {
            console.log('Removendo item de contato com SVG específico');
            menuItem.remove();
          } else {
            // Verifica o path específico do SVG do WhatsApp
            const specificPath = svg.querySelector('path[d="M9.114 20.96c.149 0 .298.045.436.114a10.6 10.6 0 0 0 5.369 1.457c5.851 0 10.612-4.761 10.612-10.612S20.77 1.307 14.92 1.307 4.307 6.067 4.307 11.919c0 1.87.493 3.694 1.422 5.3a.87.87 0 0 1 .092.654l-1.147 4.291 4.222-1.17a.7.7 0 0 1 .218-.035"]');
            if (specificPath) {
              console.log('Removendo item de contato pelo path específico');
              menuItem.remove();
            }
          }
        }
      });

      // Tentando localizar pelo HTML completo
      const allDivs = document.querySelectorAll('div.custom-setting-menu-item');
      allDivs.forEach(div => {
        // Verificando apenas o conteúdo textual
        if (div.textContent && div.textContent.trim() === "Contate-nos") {
          const svg = div.querySelector('svg[viewBox="0 0 30 31"]');
          if (svg) {
            console.log('Removendo item de contato pelo texto e SVG');
            div.remove();
          }
        }
        
        // Verificando atributos específicos do SVG
        const svg = div.querySelector('svg[width="24"][height="24"][viewBox="0 0 30 31"]');
        if (svg) {
          console.log('Removendo item de contato pelos atributos do SVG');
          div.remove();
        }
      });
    });

    // Observa mudanças no DOM
    contactUsObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Executar as funções quando o documento estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      removeUnwantedElements();
      removeContactUs();
    });
  } else {
    removeUnwantedElements();
    removeContactUs();
  }
})(); 