let data = null;
let data_license = null;
let data_user_info = null;
let validate = false;
let currentLang;
async function getSelectedLanguage() {
  const result = await chrome.storage.local.get("SELECTED_LANGUAGE");
  return result.SELECTED_LANGUAGE || "pt";
}

// Usage
getSelectedLanguage().then((lang) => {
  currentLang = lang;
const storedData = localStorage.getItem("mbf_data")
? JSON.parse(atob(localStorage.getItem("mbf_data")))
: null;

data_license = {
phone: storedData ? storedData.phone : null,
unique_id: storedData ? storedData.unique_code : null,
license: storedData ? storedData.license : null,
};
//------------------------Obteniendo datos del servidor
fixModals();

appendCSS();

fetchData("", data_license.phone).then((info) => {
  data = info.data;
  removeIncesary();
  loadComplete(async () => {

    let loadingElement = document.querySelector("#mbf_loading");


    if (!data_license.phone || !data_license.unique_id) {
      location.reload();
    }



    addSidebar();
    if (data_license.license && data_license.license !== "") {
      const result = await validateLicense(
        data_license.unique_id,
        data_license.phone,
        data_license.license
      );

      if (result.success) {

        validate = true;
        data_user_info = result.data;
    
        window.postMessage(
          {
            type: "ON_FETCH_REMOTE_DATA",
            response: "",
            extraData: { type: "validate_device", mbf: true },
          },
          "*"
        );
      } else {
        if (storedData && storedData.license) {
          delete storedData.license;
          localStorage.setItem("mbf_data", btoa(JSON.stringify(storedData)));
        }
        openModalExpired();
      }
    }
    loadingElement.remove();
    document.querySelector(".main_toolbar").style.opacity = 1;
  });
});

//--------------------Detectar si est conectado

var isUserLoggedIn = setInterval(function () {
  if (Boolean(document.getElementById("pane-side")) && data) {
    clearInterval(isUserLoggedIn);
    openLoading();
  }
}, 50);

//----------------------Mostrar la ventana de cargando

function openLoading() {
  let html = `
    <div id="mbf_loading">
	<div>
      <h1>${data.loading.loading_title}</h1>
      <img src="${data.loading.loading_image}" alt="Loading" />
      <p>
        ${data.loading.loading_title_description}
      </p>
	   </div>
    </div>
    `;

  document.body.insertAdjacentHTML("beforeend", html);

}

//----------------------- Agregar botones

function addSidebar() {
  console.log("Iniciando função addSidebar");
  var ifInsertButtons = setInterval(function () {
    if (Boolean(document.querySelector(".two._aigs"))) {
      clearInterval(ifInsertButtons);

      const app = document.querySelector("._aigs > header");

      const sidebarHTML = `
      <div class="mbf-sidebar">
        <div class="logo">
            <img src="${chrome.runtime.getURL('images/icon-16.png')}" alt="Logo">
        </div>
        <div class="mbf-buttons">
          ${data.buttons.data
            .map(
              (button) => `
            <div id="${button.id}" class="btn-item">
                <div class="btn-item-img">
                    <img class="wc-user-img" src="${button.icon}">
                </div>
                <div class="btn-item-info">
                    <strong class="btn-item-info-title">${button.title}</strong>
                    <p class="btn-item-info-subtitle">${button.sub_title}</p>
                </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

      app.insertAdjacentHTML("afterbegin", sidebarHTML);
      
      // Obter referência direta à barra lateral
      const sidebar = document.querySelector('.mbf-sidebar');
      
      // Função de detecção de tema escuro específica para WhatsApp
      const detectWhatsAppDarkTheme = () => {
        try {
          // Verificações via classes e atributos
          const classAndAttrChecks = [
            document.body.classList.contains('dark'),
            document.documentElement.classList.contains('dark'),
            document.body.getAttribute('data-theme') === 'dark',
            document.documentElement.getAttribute('data-theme') === 'dark',
            document.querySelector('html.dark') !== null,
            document.querySelector('body.dark') !== null,
            document.querySelector('.dark') !== null,
            document.querySelector('[data-theme="dark"]') !== null,
            document.querySelector('._aigs.dark') !== null,
          ];
          
          // Se qualquer verificação de classe/atributo for verdadeira
          if (classAndAttrChecks.some(Boolean)) {
            return true;
          }
          
          // Verificações de cor de fundo
          const elementsToCheck = [
            'body', 
            '#app', 
            '.app-wrapper-web', 
            '._aigs', 
            '.two', 
            '.app',
            'html'
          ];
          
          for (const selector of elementsToCheck) {
            const element = document.querySelector(selector);
            if (element) {
              const style = window.getComputedStyle(element);
              const bgColor = style.backgroundColor;
              
              // Verificar se a cor é escura (baixos valores RGB)
              if (bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
                const r = parseInt(RegExp.$1);
                const g = parseInt(RegExp.$2);
                const b = parseInt(RegExp.$3);
                
                // Se a cor for escura (todos os valores < 60)
                if (r < 60 && g < 60 && b < 60) {
                  return true;
                }
              }
            }
          }
          
          // Verificação adicional para o modo escuro em meta tags
          const metaThemeColor = document.querySelector('meta[name="theme-color"]');
          if (metaThemeColor) {
            const content = metaThemeColor.getAttribute('content');
            if (content && content.match(/#([0-9a-f]{6})/i)) {
              const hex = RegExp.$1;
              const r = parseInt(hex.substring(0, 2), 16);
              const g = parseInt(hex.substring(2, 4), 16);
              const b = parseInt(hex.substring(4, 6), 16);
              
              if (r < 60 && g < 60 && b < 60) {
                return true;
              }
            }
          }
          
          // Verificar se a preferência do sistema é para tema escuro
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Verificação adicional para confirmar que o WhatsApp está em modo escuro
            // (porque alguns usuários podem ter preferência escura mas WhatsApp claro)
            const appElement = document.querySelector('#app') || document.querySelector('._aigs');
            if (appElement) {
              const bgColor = window.getComputedStyle(appElement).backgroundColor;
              if (bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
                const r = parseInt(RegExp.$1);
                const g = parseInt(RegExp.$2);
                const b = parseInt(RegExp.$3);
                
                if (r < 60 && g < 60 && b < 60) {
                  return true;
                }
              }
            }
          }
          
          return false;
        } catch (error) {
          console.error('Erro ao detectar tema:', error);
          return false;
        }
      };
      
      // Função para aplicar o tema à barra lateral
      const applyDarkThemeToSidebar = (isDark) => {
        try {
          if (isDark) {
            console.log("Aplicando tema ESCURO para toda a barra lateral");
            
            // 1. Adicionar classe dark
            sidebar.classList.add('dark');
            
            // 2. Aplicar estilos inline diretamente com !important para máxima prioridade
            sidebar.style.setProperty('background-color', '#1a1a28', 'important');
            sidebar.style.setProperty('border-right-color', '#2d2d3d', 'important');
            sidebar.style.setProperty('box-shadow', '0 0 20px rgba(0, 0, 0, 0.3)', 'important');
            sidebar.style.setProperty('color', 'white', 'important');
            
            // 3. Forçar estilo em todos os elementos filhos relevantes
            const logo = sidebar.querySelector('.logo');
            if (logo) {
              logo.style.setProperty('background-color', '#20202f', 'important');
              logo.style.setProperty('border-bottom-color', '#2d2d3d', 'important');
              logo.style.setProperty('border-bottom-style', 'solid', 'important');
              logo.style.setProperty('border-bottom-width', '1px', 'important');
            }
            
            const logoImg = sidebar.querySelector('.logo img');
            if (logoImg) {
              logoImg.style.setProperty('filter', 'brightness(1.1)', 'important');
            }
            
            // 4. Forçar estilo no contêiner de botões
            const buttonsContainer = sidebar.querySelector('.mbf-buttons');
            if (buttonsContainer) {
              buttonsContainer.style.setProperty('background-color', '#1a1a28', 'important');
            }
            
            // 5. Ajustar os botões individuais
            const buttons = sidebar.querySelectorAll('.btn-item');
            buttons.forEach(btn => {
              btn.style.setProperty('background-color', 'transparent', 'important');
              
              // Ao passar o mouse
              btn.addEventListener('mouseover', () => {
                btn.style.setProperty('background-color', '#33334d', 'important');
              });
              
              btn.addEventListener('mouseout', () => {
                btn.style.setProperty('background-color', 'transparent', 'important');
              });
            });
          } else {
            console.log("Aplicando tema CLARO para toda a barra lateral");
            
            // 1. Remover classe dark
            sidebar.classList.remove('dark');
            
            // 2. Remover estilos inline
            sidebar.style.setProperty('background-color', 'white', 'important');
            sidebar.style.removeProperty('border-right-color');
            sidebar.style.removeProperty('box-shadow');
            sidebar.style.removeProperty('color');
            
            // 3. Remover estilos dos elementos filhos
            const logo = sidebar.querySelector('.logo');
            if (logo) {
              logo.style.removeProperty('background-color');
              logo.style.removeProperty('border-bottom-color');
              logo.style.removeProperty('border-bottom-style');
              logo.style.removeProperty('border-bottom-width');
            }
            
            const logoImg = sidebar.querySelector('.logo img');
            if (logoImg) {
              logoImg.style.removeProperty('filter');
            }
            
            // 4. Remover estilos do contêiner de botões
            const buttonsContainer = sidebar.querySelector('.mbf-buttons');
            if (buttonsContainer) {
              buttonsContainer.style.removeProperty('background-color');
            }
            
            // 5. Remover estilos dos botões
            const buttons = sidebar.querySelectorAll('.btn-item');
            buttons.forEach(btn => {
              btn.style.removeProperty('background-color');
              
              // Remover event listeners anteriores e adicionar para tema claro
              btn.addEventListener('mouseover', () => {
                btn.style.setProperty('background-color', '#eeeeff', 'important');
              });
              
              btn.addEventListener('mouseout', () => {
                btn.style.removeProperty('background-color');
              });
            });
          }
        } catch (error) {
          console.error('Erro ao aplicar tema:', error);
        }
      };
      
      // Verificar e aplicar tema inicial
      const updateTheme = () => {
        const isDarkTheme = detectWhatsAppDarkTheme();
        console.log("Tema escuro detectado:", isDarkTheme);
        applyDarkThemeToSidebar(isDarkTheme);
      };
      
      // Aplicar tema inicial
      updateTheme();
      
      // Verificar periodicamente
      const themeInterval = setInterval(updateTheme, 500);
      
      // Adicionar verificação ao carregar/alterar a página
      window.addEventListener('load', updateTheme);
      window.addEventListener('DOMContentLoaded', updateTheme);
      
      // Observar mudanças nos elementos relevantes
      const themeObserver = new MutationObserver(() => {
        updateTheme();
      });
      
      // Observar o body e documentElement para mudanças de classe e estilo
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'style'],
      });
      
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'style'],
      });
      
      // Também observar elementos específicos do WhatsApp
      const whatsappElements = ['#app', '._aigs', '.app-wrapper-web', '.two'].map(selector => 
        document.querySelector(selector)).filter(Boolean);
      
      whatsappElements.forEach(element => {
        themeObserver.observe(element, {
          attributes: true,
          attributeFilter: ['class', 'data-theme', 'style'],
        });
      });

      const items = [
        { id: "sending_messages", index: 1 },
        { id: "lists", index: 2 },
        { id: "templates", index: 3 },
        { id: "workflow", index: 4 },
        { id: "schedule_messages", index: 5 },
        { id: "scheduled_shipments", index: 6 },
        { id: "quick_reply", index: 7 },
        { id: "kanban_board", index: 8 },
        { id: "functions", index: 9 },
        { id: "tools_free", index: 10 },
        { id: "user", index: 11 },
      ];

      items.forEach((item) => {
        const element = document.querySelector(`#${item.id}`);
        if (element) {
          element.addEventListener("click", () => {
            if (validate === false && item.index != 11) {
              openModalPrice();
            } else {
              let menu = document.querySelector(
                `.main_toolbar > .right_buttons-side > div > div > .ant-space-item:nth-child(${item.index})`
              );
              menu.querySelector("button").click();
            }
          });
        }
      });
    }
  }, 50);
}

//----------------------- Load complete function

function loadComplete(callback) {
  const observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach(function (node) {
          if (node.classList && node.classList.contains("main_toolbar")) {
            observer.disconnect();
            node.style.opacity = 0;

            let intervalId;

            intervalId = setInterval(() => {
              const logoElement = node.querySelector(
                ".custom-product-logo-layout"
              );
              const leftTabElement = node.querySelector(".left_tab-side");
              const rightButtonsElement = node.querySelector(
                ".right_buttons-side"
              );

              if (logoElement && leftTabElement && rightButtonsElement) {
                clearInterval(intervalId); // Clear the interval
                if (typeof callback === "function") {
                  callback();
                }
              }
            }, 100);
          }
        });
      }
    });
  });

  const config = { childList: true, subtree: true };
  observer.observe(document.body, config);
}

//----------------------- Fetch data function

async function fetchData(key = "", phone) {
  const ajaxUrl = new URL(
    "https://aquizapex.aquifome.com.br/api/panouncement.php"
  );
  ajaxUrl.searchParams.append("action", "get_data");

  if (key) {
    ajaxUrl.searchParams.append("key", key);
  }

  if(lang){
    ajaxUrl.searchParams.append("lang", lang);
  }

  try {
    const response = await fetch(ajaxUrl, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

//-------------------  Abrir el modal licencia expirada

// Set your current language using a two‐letter code
// Options: "en" (English), "es" (Spanish), "pt" (Portuguese), "fr" (French)
const SELECTED_LANGUAGE = lang;

// Translation texts for the modals
const translations = {
  en: {
    modalLicense: {
      title: "License Details",
      description:
        "Here you will find detailed information about your license and options to uninstall it if necessary.",
      table: {
        user: "User:",
        phone: "Phone:",
        license: "License:",
        plan: "Plan:",
        next_payment: "Next Payment:",
      },
      buttons: {
        uninstall: "Uninstall License",
        close: "Close",
      },
    },
    modalExpired: {
      description:
        "Your license has expired. Renew now to continue enjoying uninterrupted service.",
      button: {
        title: "Renew License",
        // Assuming data.expired.button.link is available from your data object.
        // Otherwise, you can hardcode a link here.
      },
      close: "Close",
    },
    modalKey: {
      title: "You must enter a key",
      description:
        "Please enter your license key in the field below to activate advanced features.",
      button: "Validate",
      empty_error: "You must enter your license",
      success:
        "Hello {user}, your license for the \"{plan}\" plan has been successfully activated. Your next payment is scheduled for {date}. Thank you for trusting us!",
    },
    modalPrice: {
      title: "Choose Your Plan",
      description:
        'If you already have a license, click here to access: <a href="#" class="open-insert-key">Enter key</a>',
      toggle: {
        month: "Month",
        year: "Year",
      },
      buy: "Buy",
      close: "Close",
    },
  },
  es: {
    modalLicense: {
      title: "Detalles de la Licencia",
      description:
        "Aquí encontrarás información detallada sobre tu licencia y opciones para desinstalarla, si es necesario.",
      table: {
        user: "Usuario:",
        phone: "Teléfono:",
        license: "Licencia:",
        plan: "Plan:",
        next_payment: "Próximo pago:",
      },
      buttons: {
        uninstall: "Desinstalar licencia",
        close: "Cerrar",
      },
    },
    modalExpired: {
      description:
        "Tu licencia ha expirado. Renueva ahora para continuar disfrutando del servicio sin interrupciones.",
      button: {
        title: "Renovar licencia",
      },
      close: "Cerrar",
    },
    modalKey: {
      title: "Debes ingresar una clave",
      description:
        "Debes ingresar tu licencia en el siguiente campo para activar las funciones avanzadas.",
      button: "Validar",
      empty_error: "Debes ingresar tu licencia",
      success:
        "Hola {user}, tu licencia del plan \"{plan}\" se ha activado correctamente. Tu próximo pago está programado para {date}. ¡Gracias por confiar en nosotros!",
    },
    modalPrice: {
      title: "Elige tu Plan",
      description:
        'Si ya tienes una licencia, haz clic aquí para acceder: <a href="#" class="open-insert-key">Insertar clave</a>',
      toggle: {
        month: "Mes",
        year: "Año",
      },
      buy: "Comprar",
      close: "Cerrar",
    },
  },
  pt: {
    modalLicense: {
      title: "Detalhes da Licença",
      description:
        "",
      table: {
        user: "Usuário:",
        phone: "Telefone:",
        license: "Licença:",
        plan: "Plano:",
        next_payment: "Próximo pagamento:",
      },
      buttons: {
        uninstall: "Desinstalar licença",
        close: "Fechar",
      },
    },
    modalExpired: {
      description:
        "Sua licença expirou. Renove agora para continuar aproveitando o serviço sem interrupções.",
      button: {
        title: "Renovar licença",
      },
      close: "Fechar",
    },
    modalKey: {
      title: "<center>Ative seu CRM</center>",
      description:
        "",
      button: "Ativar 😍",
      empty_error: "Você deve inserir sua licença",
      success:
        "Olá {user}, sua licença do plano \"{plan}\" foi ativada com sucesso. Seu próximo pagamento está programado para {date}. Obrigado!",
    },
    modalPrice: {
      title: "<center>Escolha seu Plano</center>",
      description:
        'Se você já tem uma licença, clique <a href="#" class="open-insert-key"><strong>AQUI</strong></a>',
      toggle: {
        month: "Plano Mensal",
        year: "Plano Anual",
      },
      buy: "Comprar",
      close: "Fechar",
    },
  },
  fr: {
    modalLicense: {
      title: "Détails de la Licence",
      description:
        "Ici, vous trouverez des informations détaillées sur votre licence et des options pour la désinstaller si nécessaire.",
      table: {
        user: "Utilisateur:",
        phone: "Téléphone:",
        license: "Licence:",
        plan: "Plan:",
        next_payment: "Prochain paiement:",
      },
      buttons: {
        uninstall: "Désinstaller la licence",
        close: "Fermer",
      },
    },
    modalExpired: {
      description:
        "Votre licence a expiré. Renouvelez-la dès maintenant pour continuer à profiter d'un service ininterrompu.",
      button: {
        title: "Renouveler la licence",
      },
      close: "Fermer",
    },
    modalKey: {
      title: "Vous devez entrer une clé",
      description:
        "Veuillez saisir votre licence dans le champ ci-dessous pour activer les fonctionnalités avancées.",
      button: "Valider",
      empty_error: "Vous devez entrer votre licence",
      success:
        "Bonjour {user}, votre licence pour le plan \"{plan}\" a été activée avec succès. Votre prochain paiement est prévu pour le {date}. Merci de votre confiance!",
    },
    modalPrice: {
      title: "Choisissez votre Plan",
      description:
        'Si vous possédez déjà une licence, cliquez ici pour y accéder: <a href="#" class="open-insert-key">Entrer la clé</a>',
      toggle: {
        month: "Mois",
        year: "Année",
      },
      buy: "Acheter",
      close: "Fermer",
    },
  },
};

//================================================================
// Function to open the license details modal
//================================================================
function openModalLicense() {
  const html = `
  <div id="modalLicense" class="modal">
    <div class="modal-content">
      <button class="close"></button>
      <!-- Start - Modal content -->
      <h1 class="modal-title">${translations[SELECTED_LANGUAGE].modalLicense.title}</h1>
      <p class="modal-description">${translations[SELECTED_LANGUAGE].modalLicense.description}</p>

      <table class="user-info-table">
        <tbody>
          <tr>
            <td><strong>${translations[SELECTED_LANGUAGE].modalLicense.table.user}</strong></td>
            <td>${data_user_info.userDeviceData.device_data.userName}</td>
          </tr>
          <tr>
            <td><strong>${translations[SELECTED_LANGUAGE].modalLicense.table.phone}</strong></td>
            <td>${data_user_info.userDeviceData.device_data.skd_wa_no}</td>
          </tr>
          <tr>
            <td><strong>${translations[SELECTED_LANGUAGE].modalLicense.table.license}</strong></td>
            <td>${data_user_info.userDeviceData.skey}</td>
          </tr>
          <tr>
            <td><strong>${translations[SELECTED_LANGUAGE].modalLicense.table.plan}</strong></td>
            <td>${data_user_info.userDeviceData.plan_type}</td>
          </tr>
          <tr>
            <td><strong>${translations[SELECTED_LANGUAGE].modalLicense.table.next_payment}</strong></td>
            <td>${data_user_info.userDeviceData.validate.end_date}</td>
          </tr>
        </tbody>
      </table>
      <div class="modal-buttons" style="margin-top: 20px;">
        <button type="button" class="uninstall-button mbf_button">${translations[SELECTED_LANGUAGE].modalLicense.buttons.uninstall}</button>
        <button type="button" class="close-button mbf_button alternative">${translations[SELECTED_LANGUAGE].modalLicense.buttons.close}
</button>
      </div>
      <!-- End - Modal content -->
    </div>
  </div>
  `;

  // Close any existing modals before opening the new one.
  document.querySelectorAll(".mbf-ant-modal-close").forEach(item => item.click());
  document.body.insertAdjacentHTML("beforeend", html);

  const modal = document.getElementById("modalLicense");
  const modalClose = modal.querySelector(".close");
  const button_uninstall = modal.querySelector(".uninstall-button");
  const button_close = modal.querySelector(".close-button");

  modal.style.display = "flex";

  modalClose.onclick = () => {
    modal.style.display = "none";
    modal.remove();
  };
  button_close.onclick = () => {
    modal.style.display = "none";
    modal.remove();
  };

  button_uninstall.onclick = async () => {
    modal.classList.add("loading");
    const result = await uninstallLicense(data_license.license);

    if (result.success) {
      validate = false;
      localStorage.removeItem("mbf_data");
      alert(result.message);
      setTimeout(() => {
        location.reload();
      }, 500);
    } else {
      modal.classList.remove("loading");
      alert(result.message);
      return false;
    }
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      modal.remove();
    }
  };
}

//================================================================
// Function to open the expired license modal
//================================================================
function openModalExpired() {
  const html = `
  <div id="modalPrice" class="modal">
    <div class="modal-content">
      <button class="close">${translations[SELECTED_LANGUAGE].modalExpired.close}</button>
      <!-- Start - Modal content -->
      <div class="expired_description">${data.expired.description}</div>
      <a href="${data.expired.button.link}" target="_blank" class="btn-swal expired_button swal2-styled swal2-default-outline">
        ${translations[SELECTED_LANGUAGE].modalExpired.button.title}
      </a>
      <div class="modal-buttons">
        <button type="button" class="expired_button mbf_button">${translations[SELECTED_LANGUAGE].modalExpired.close}</button>
      </div>
      <!-- End - Modal content -->
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
  const modal = document.getElementById("modalPrice");
  const modalClose = modal.querySelector(".close");
  const button = modal.querySelector(".mbf_button");

  modal.style.display = "flex";
  modalClose.onclick = () => {
    modal.style.display = "none";
    modal.remove();
  };
  button.onclick = () => {
    modal.style.display = "none";
    modal.remove();
  };
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      modal.remove();
    }
  };
}

//================================================================
// Function to open the license key modal
//================================================================
function openModalKey() {
  const html = `
<div id="modalPrice" class="modal">
  <div class="modal-content">
    <button class="close"></button>
    <!-- Start - Modal content -->
    <h1 class="modal-title">${translations[SELECTED_LANGUAGE].modalKey.title}</h1>
    <div class="modal-description">
      ${translations[SELECTED_LANGUAGE].modalKey.description}
    </div>
    <div class="toggle-price">
      <input type="text" class="mbf_input_text" style="margin-bottom:20px;"/>
      <div class="mbf_button">${translations[SELECTED_LANGUAGE].modalKey.button}</div>
    </div>
    <!-- End - Modal content -->
  </div>
</div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
  const modal = document.getElementById("modalPrice");
  const modalClose = modal.querySelector(".close");

  modal.style.display = "flex";
  modalClose.onclick = () => {
    modal.style.display = "none";
    modal.remove();
  };
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      modal.remove();
    }
  };

  const input = modal.querySelector(".mbf_input_text");
  const button = modal.querySelector(".mbf_button");

  button.addEventListener("click", async () => {
    if (input.value === "") {
      alert(translations[SELECTED_LANGUAGE].modalKey.empty_error);
    } else {
      modal.classList.add("loading");
      const result = await validateLicense(
        data_license.unique_id,
        data_license.phone,
        input.value
      );

      if (result.success) {
        modal.classList.remove("loading");
        window.postMessage(
          {
            type: "ON_FETCH_REMOTE_DATA",
            response: "",
            extraData: { type: "validate_device", mbf: true },
          },
          "*"
        );
        modal.style.display = "none";
        modal.remove();
        validate = true;
        data_user_info = result.data;
        storeLicenseKey(input.value);

        let successMsg = translations[SELECTED_LANGUAGE].modalKey.success;
        successMsg = successMsg.replace("{user}", data_user_info.userDeviceData.device_data.skd_wa_no)
                               .replace("{plan}", data_user_info.userDeviceData.plan_type)
                               .replace("{date}", data_user_info.userDeviceData.validate.end_date);
        alert(successMsg);
      } else {
        modal.classList.remove("loading");
        input.value = "";
        input.focus();
        alert(result.message);
      }
    }
  });
}

//================================================================
// Function to open the subscription (price) modal
//================================================================
function openModalPrice() {
  const html = `
<div id="modalPrice" class="modal">
  <div class="modal-content">
    <button class="close"></button>
    <!-- Start - Modal content -->
    <h1 class="modal-title">${translations[SELECTED_LANGUAGE].modalPrice.title}</h1>
    <div class="modal-description">
      ${translations[SELECTED_LANGUAGE].modalPrice.description}
    </div>
    <div class="toggle-price">
      <input type="checkbox" id="toggle" class="toggle-checkbox" />
      <label for="toggle" class="toggle-container">
        <div>${translations[SELECTED_LANGUAGE].modalPrice.toggle.month}</div> 
        <div>${translations[SELECTED_LANGUAGE].modalPrice.toggle.year}</div>
      </label>
    </div>
    <div class="carousel-container">
      <button class="carousel-btn left-btn">←</button>
      <ul>
        ${data.table_price
          .map((item) => {
            return `<li class="subscription"> 
                      <div class="subscription_header">
                        <h2 class="subscription_header_title">${item.title}</h2>
                        ${
                          item.description === "-"
                            ? `<div class="subscription_header_description">${item.description}</div>`
                            : ""
                        }
                      </div>
                      <div class="subscription_content">
                        <ul class="subscription_feature">
                          ${item.features.join("")}
                        </ul>
                        <div class="subscription_price">
                          <span class="subscription_price_old">*</span>
                          <span class="subscription_price_current">*</span>
                        </div>
                      </div>
                      <div class="subscription_footer">
                        <a class="mbf_button" href="${item.url}" target="_blank">${translations[SELECTED_LANGUAGE].modalPrice.buy}</a>
                      </div>
                    </li>`;
          })
          .join('')}
      </ul>
      <button class="carousel-btn right-btn">→</button>
    </div>
    <!-- End - Modal content -->
  </div>
</div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
  const modal = document.getElementById("modalPrice");
  const modalClose = modal.querySelector(".close");

  modal.style.display = "flex";
  modalClose.onclick = () => {
    modal.style.display = "none";
    modal.remove();
  };
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      modal.remove();
    }
  };

  const carousel = modal.querySelector(".carousel-container ul");
  const leftBtn = modal.querySelector(".carousel-container .left-btn");
  const rightBtn = modal.querySelector(".carousel-container .right-btn");
  const items = modal.querySelectorAll(".carousel-container li.subscription");
  const check = modal.querySelector(".toggle-price input");
  const openInsertKeyLink = modal.querySelector(".open-insert-key");

  function getCurrentIndex() {
    const itemWidth = items[0].clientWidth;
    const scrollLeft = carousel.scrollLeft;
    return Math.round(scrollLeft / itemWidth);
  }

  leftBtn.addEventListener("click", () => {
    carousel.scrollLeft -= carousel.clientWidth;
    setTimeout(get_price, 100);
  });

  rightBtn.addEventListener("click", () => {
    carousel.scrollLeft += carousel.clientWidth;
    setTimeout(get_price, 100);
  });

  check.addEventListener("change", get_price);

  if (openInsertKeyLink) {
    openInsertKeyLink.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "none";
      modal.remove();
      openModalKey();
    });
  }

  function get_price() {
    const currentIndex = getCurrentIndex();
    const slide = carousel.children[currentIndex];
    let info = data.table_price[currentIndex];

    if (info.variations.length === 0) {
      modal.querySelector(".toggle-price").classList.add("disabled");
      if (info.old_price === null) {
        slide.querySelector(".subscription_price_old").style.display = "none";
        slide.querySelector(".subscription_price_current").innerHTML = info.regular_price;
      } else {
        slide.querySelector(".subscription_price_old").style.display = "inline";
        slide.querySelector(".subscription_price_current").style.display = "inline";
        slide.querySelector(".subscription_price_old").innerHTML = info.old_price;
        slide.querySelector(".subscription_price_current").innerHTML = info.regular_price;
      }
    } else {
      modal.querySelector(".toggle-price").classList.remove("disabled");
      if (check.checked) {
        if (info.variations[1].old_price === null) {
          slide.querySelector(".subscription_price_old").style.display = "none";
          slide.querySelector(".subscription_price_current").innerHTML = info.variations[1].regular_price;
        } else {
          slide.querySelector(".subscription_price_old").style.display = "inline";
          slide.querySelector(".subscription_price_old").innerHTML = info.variations[1].old_price;
          slide.querySelector(".subscription_price_current").innerHTML = info.variations[1].regular_price;
        }
      } else {
        if (info.variations[0].old_price === null) {
          slide.querySelector(".subscription_price_old").style.display = "none";
          slide.querySelector(".subscription_price_current").innerHTML = info.variations[0].regular_price;
        } else {
          slide.querySelector(".subscription_price_old").style.display = "inline";
          slide.querySelector(".subscription_price_old").innerHTML = info.variations[0].old_price;
          slide.querySelector(".subscription_price_current").innerHTML = info.variations[0].regular_price;
        }
      }
    }
  }

  get_price();
}

//------------Validar Licencia

async function validateLicense(unique_id, phone, license) {
  try {
  const params = new URLSearchParams({
    unique_id: unique_id,
    phone: phone,
    license: license,
  }).toString();

  const url = `https://aquizapex.aquifome.com.br/api/pvalidate.php?${params}`;
    const response = await fetch(url, { method: "GET" });
    const res = await response.json();

    if (res.status === 200) {
      return { success: true, message: res.message, data: res.dData };
    } else {
      return { success: false, message: res.message };
    }
  } catch (error) {
    console.error("Erro na validação da licença:", error);
    return { success: false, message: "Erro de rede ou servidor" };
  }
}

//----------------------Almacenar la licencia

function storeLicenseKey(licenseValue) {
  const localStorageKey = "mbf_data";

  function encryptData(data) {
    return btoa(JSON.stringify(data));
  }

  function decryptData(encryptedData) {
    return JSON.parse(atob(encryptedData));
  }

  let storedData = null;

  try {
    const encryptedData = localStorage.getItem(localStorageKey);
    storedData = encryptedData ? decryptData(encryptedData) : null;
  } catch (e) {}

  if (!storedData) {
    storedData = {
      license: licenseValue,
    };
  } else {
    storedData.license = licenseValue;
  }

  try {
    localStorage.setItem(localStorageKey, encryptData(storedData));
  } catch (e) {}
}

//----------------------- Fix Modals

function fixModals() {
  let button = `<button type="button" aria-label="Close" class="mbf-ant-modal-close"><span class="ant-modal-close-x"><span role="img" aria-label="close" class="anticon anticon-close ant-modal-close-icon"><svg fill-rule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.7-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path></svg></span></span></button>`;

  const observer1 = new MutationObserver(() => {
    const customSettingMenu = document.querySelector(
      ".ant-popover-inner-content .custom-setting-menu"
    );
    if (customSettingMenu) {
      observer1.disconnect();

      const element =
        customSettingMenu.closest(".ant-popover").parentElement.parentElement;

      let popover = element.querySelector(".ant-popover");

      element
        .querySelector(".ant-popover-content")
        .insertAdjacentHTML("afterbegin", button);

      element
        .querySelector(".mbf-ant-modal-close")
        .addEventListener("click", () => {
          popover.classList.add("ant-popover-hidden");
        });

      element.classList.add("full-screen");

      const headerDiv = element.querySelector(
        ".custom-setting-menu-header div"
      );

      headerDiv.innerHTML = "";
      headerDiv.innerHTML = `<p>${data_user_info?.userDeviceData?.device_data?.skd_wa_no || data_license.phone
      }</p>`;

      const menuItemLicense = document.querySelector(
        ".custom-setting-menu-items-layout .custom-setting-menu-item:nth-child(1)"
      );
      if(validate==false){
        const settings = document.querySelector(
          ".custom-setting-menu-items-layout .custom-setting-menu-item:nth-child(5)"
        );
        const newSettings = settings.cloneNode(true);
        settings.replaceWith(newSettings);
  
        newSettings.addEventListener('click', function(){
          if(validate == false){
            openModalKey();
          }
        })
      }
      const newMenuItemLicense = menuItemLicense.cloneNode(true);
      menuItemLicense.replaceWith(newMenuItemLicense);
      newMenuItemLicense.addEventListener("click", function () {
        if(validate == true){
          openModalLicense();
        }else{
          openModalKey();
        }
      });
    }
  });

  // Crear un MutationObserver
  const observer2 = new MutationObserver(() => {
    const customSettingMenu = document.querySelector(
      ".ant-popover-inner-content .custom-advance-tools-menu"
    );
    if (customSettingMenu) {
      observer2.disconnect();

      const element =
        customSettingMenu.closest(".ant-popover").parentElement.parentElement;
      let popover = element.querySelector(".ant-popover");

      element
        .querySelector(".ant-popover-content")
        .insertAdjacentHTML("afterbegin", button);

      element
        .querySelector(".mbf-ant-modal-close")
        .addEventListener("click", () => {
          popover.classList.add("ant-popover-hidden");
        });

      element.classList.add("full-screen");
    }
  });

  observer2.observe(document.body, { childList: true, subtree: true });

  observer1.observe(document.body, { childList: true, subtree: true });
}

// Eliminar cosas innesesarias------------------------

function removeIncesary() {
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const targetElementLogoTag = document.querySelector(
          'img[src="https://wawf.app/wp-content/uploads/2022/12/WA-WorkFlow-logo-design-270x51-1.webp"]'
        );
        if (targetElementLogoTag) {
          targetElementLogoTag.src = chrome.runtime.getURL('images/icon-16.png');
          const parentElementLogoTag = targetElementLogoTag.parentElement;

          if (parentElementLogoTag) {
            parentElementLogoTag.classList.add("wraper-logo-tag");
            // Remover qualquer link que possa envolver o logo
            if (parentElementLogoTag.tagName === 'A') {
              const grandParent = parentElementLogoTag.parentElement;
              if (grandParent) {
                // Preservar o elemento de imagem, mas remover o link
                const imgClone = targetElementLogoTag.cloneNode(true);
                const divWrapper = document.createElement('div');
                divWrapper.className = 'wraper-logo-tag';
                divWrapper.appendChild(imgClone);
                grandParent.replaceChild(divWrapper, parentElementLogoTag);
              }
            }
          }
        }

        // Procurar por outros logos no DOM que possam estar usando links externos
        const allExternalLogos = document.querySelectorAll('a[href*="https://aquizapex.aquifome.com.br"]');
        allExternalLogos.forEach(link => {
          const imgInside = link.querySelector('img');
          if (imgInside) {
            imgInside.src = chrome.runtime.getURL('images/icon-16.png');
            // Substituir o link por um div
            const parentElement = link.parentElement;
            if (parentElement) {
              const divWrapper = document.createElement('div');
              divWrapper.className = link.className;
              divWrapper.appendChild(imgInside.cloneNode(true));
              parentElement.replaceChild(divWrapper, link);
            }
          }
        });

        const targetElement = document.querySelector(
          ".ant-modal-root ul.ant-rate"
        );
        if (targetElement) {
          const modalRoot = document.querySelector(".ant-modal-root");
          if (modalRoot) {
            modalRoot.remove();
          }
        }
      }
    }
  });

  // Observa los cambios en todo el body
  observer.observe(document.body, { childList: true, subtree: true });
}

// Injectar Estilos -------------------------------------
function appendCSS() {
  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);

  // Adicionar o arquivo de substituição de cores para garantir que #148040 seja substituída por #148040
  const colorOverrideLink = document.createElement('link');
  colorOverrideLink.rel = 'stylesheet';
  colorOverrideLink.href = chrome.runtime.getURL('color-override.css');
  document.head.appendChild(colorOverrideLink);

  styleElement.textContent = `

  
/*Inicio - Etiqeutas --------------------*/


span.top-tabbar-badge-class {
    background: #148040 !important;
    color:white; 
}

.dark span.top-tabbar-badge-class {
    background: white !important;
    color:black; 
}




#main_section .main_toolbar .left_tab-side .ant-tabs-tab[data-node-key]:hover:after {
  background: #148040 !important;
  border: 1px solid #148040 !important;
}

/*Final - Etiqeutas --------------------*/

`;
}

//Desintalar lisencia -------------------------------------

async function uninstallLicense(license) {
  try {
    const res = {
      status: 200,
      message: "done"
    }

    if (res.status === 200) {
      return { success: true, message: res.message };
    } else {
      return { success: false, message: res.message };
    }
  } catch (error) {
    return { success: false, message: "Error de red o servidor" };
  }
}

});

// Corrigir o listener de mudanças no storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.SELECTED_LANGUAGE) {
    const newLang = changes.SELECTED_LANGUAGE.newValue;
    if (newLang !== currentLang) {
      currentLang = newLang;
    window.location.reload();
    }
  }
});

// Substituir o MutationObserver antigo por um novo
function setupDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Atualizar a interface quando necessário
        updateScheduleInterface();
        ensureTabsVisibility();
      }
    });
  });

  // Configurar o observer para observar mudanças no DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Função para garantir que as guias estejam visíveis
function ensureTabsVisibility() {
  const mainToolbar = document.querySelector('.main_toolbar');
  const leftTabSide = document.querySelector('.left_tab-side');
  const rightButtonsSide = document.querySelector('.right_buttons-side');

  if (mainToolbar) {
    mainToolbar.style.display = 'flex';
    mainToolbar.style.opacity = '1';
    mainToolbar.style.visibility = 'visible';
  }

  if (leftTabSide) {
    leftTabSide.style.display = 'flex';
    leftTabSide.style.opacity = '1';
    leftTabSide.style.visibility = 'visible';
  }

  if (rightButtonsSide) {
    rightButtonsSide.style.display = 'flex';
    rightButtonsSide.style.opacity = '1';
    rightButtonsSide.style.visibility = 'visible';
  }

  // Verificar e sincronizar o tema escuro
  checkAndApplyDarkMode();
}

// Função mais robusta para detectar o tema escuro
function checkAndApplyDarkMode() {
  try {
    // 1. Verificar tema no WhatsApp
    const isDarkMode = 
      document.documentElement.classList.contains('dark') || 
      document.body.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.body.getAttribute('data-theme') === 'dark' ||
      document.querySelector('._aigs.dark') !== null ||
      document.querySelector('._aigs[data-theme="dark"]') !== null;
    
    // 2. Verificar cor de fundo dos elementos principais
    const checkBackgroundColor = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      
      // Se o elemento tiver uma cor de fundo escura (RGB baixo)
      if (bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
        const r = parseInt(RegExp.$1);
        const g = parseInt(RegExp.$2);
        const b = parseInt(RegExp.$3);
        return (r < 50 && g < 50 && b < 50);
      }
      return false;
    };
    
    // Verificar elementos principais
    const isBodyDark = checkBackgroundColor('body');
    const isAppDark = checkBackgroundColor('#app');
    const isAppWrapperDark = checkBackgroundColor('.app-wrapper-web');
    const isAigsDark = checkBackgroundColor('._aigs');
    
    // Determinar o modo final
    const shouldUseDarkMode = isDarkMode || isBodyDark || isAppDark || isAppWrapperDark || isAigsDark;
    
    console.log('Tema escuro detectado:', shouldUseDarkMode);
    
    // Aplicar à barra lateral
    const sidebar = document.querySelector('.mbf-sidebar');
    if (sidebar) {
      if (shouldUseDarkMode) {
        // Aplicar classe e estilos diretos
        sidebar.classList.add('dark');
        
        // Forçar o estilo escuro diretamente
        sidebar.style.setProperty('background-color', '#1a1a28', 'important');
        sidebar.style.setProperty('border-right-color', '#2d2d3d', 'important');
        sidebar.style.setProperty('box-shadow', '0 0 20px rgba(0, 0, 0, 0.3)', 'important');
        
        // Aplicar também a todos os elementos filhos
        const allElements = sidebar.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.classList.contains('logo') || el.parentElement.classList.contains('logo')) {
            el.style.setProperty('background-color', '#20202f', 'important');
            el.style.setProperty('border-bottom-color', '#2d2d3d', 'important');
          }
          
          if (el.tagName === 'IMG') {
            el.style.setProperty('filter', 'brightness(1.1)', 'important');
          }
        });
        
        // Aplicar ao contêiner de botões
        const buttonsContainer = sidebar.querySelector('.mbf-buttons');
        if (buttonsContainer) {
          buttonsContainer.style.setProperty('background-color', '#1a1a28', 'important');
        }
      } else {
        // Remover estilos escuros
        sidebar.classList.remove('dark');
        
        // Limpar estilos diretos
        sidebar.style.removeProperty('background-color');
        sidebar.style.removeProperty('border-right-color');
        sidebar.style.removeProperty('box-shadow');
        
        // Limpar estilos de todos os elementos filhos
        const allElements = sidebar.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.classList.contains('logo') || el.parentElement.classList.contains('logo')) {
            el.style.removeProperty('background-color');
            el.style.removeProperty('border-bottom-color');
          }
          
          if (el.tagName === 'IMG') {
            el.style.removeProperty('filter');
          }
        });
        
        // Limpar estilos do contêiner de botões
        const buttonsContainer = sidebar.querySelector('.mbf-buttons');
        if (buttonsContainer) {
          buttonsContainer.style.removeProperty('background-color');
        }
      }
    }
    
    // Verificar novamente
    setTimeout(checkAndApplyDarkMode, 1000);
  } catch (error) {
    console.error('Erro ao verificar tema:', error);
    setTimeout(checkAndApplyDarkMode, 2000);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  setupDOMObserver();
  ensureTabsVisibility();
  checkAndApplyDarkMode(); // Verificar o tema imediatamente
  
  // Iniciar o sistema de verificação de agendamentos
  if (!window.scheduleCheckInterval) {
    startScheduleCheck();
  }
  
  // Monitorar especificamente elementos do WhatsApp para tema escuro
  monitorWhatsAppTheme();
});

// Função para monitorar especificamente o tema do WhatsApp
function monitorWhatsAppTheme() {
  // Lista de elementos do WhatsApp que podem indicar o tema
  const whatsappSelectors = [
    '.app-wrapper-web',
    '._aigs',
    '._aohf',
    '#app',
    '.two'
  ];

  // Função para verificar o tema com base nos elementos do WhatsApp
  const checkThemeFromWhatsApp = () => {
    for (const selector of whatsappSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        // Verificar se a cor de fundo indica tema escuro (valores RGB baixos)
        if (bgColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
          const r = parseInt(RegExp.$1);
          const g = parseInt(RegExp.$2);
          const b = parseInt(RegExp.$3);
          
          // Se a cor de fundo for escura
          if (r < 50 && g < 50 && b < 50) {
            console.log(`Tema escuro detectado no elemento ${selector}`);
            applyDarkThemeToSidebar();
            return;
          }
        }
        
        // Verificar se tem classes ou atributos que indicam tema escuro
        if (element.classList.contains('dark') || 
            element.getAttribute('data-theme') === 'dark') {
          console.log(`Classe de tema escuro detectada no elemento ${selector}`);
          applyDarkThemeToSidebar();
          return;
        }
      }
    }
    
    // Se chegou aqui, não detectou tema escuro
    applyLightThemeToSidebar();
  };
  
  // Aplicar tema escuro diretamente
  function applyDarkThemeToSidebar() {
    const sidebar = document.querySelector('.mbf-sidebar');
    if (sidebar) {
      sidebar.classList.add('dark');
      sidebar.style.backgroundColor = '#1a1a28';
      sidebar.style.borderRightColor = '#2d2d3d';
      sidebar.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
      
      const logo = sidebar.querySelector('.logo');
      if (logo) {
        logo.style.borderBottomColor = '#2d2d3d';
        logo.style.backgroundColor = '#20202f';
        
        const logoImg = logo.querySelector('img');
        if (logoImg) {
          logoImg.style.filter = 'brightness(1.1)';
        }
      }
    }
  }
  
  // Aplicar tema claro diretamente
  function applyLightThemeToSidebar() {
    const sidebar = document.querySelector('.mbf-sidebar');
    if (sidebar) {
      sidebar.classList.remove('dark');
      sidebar.style.backgroundColor = '';
      sidebar.style.borderRightColor = '';
      sidebar.style.boxShadow = '';
      
      const logo = sidebar.querySelector('.logo');
      if (logo) {
        logo.style.borderBottomColor = '';
        logo.style.backgroundColor = '';
        
        const logoImg = logo.querySelector('img');
        if (logoImg) {
          logoImg.style.filter = '';
        }
      }
    }
  }

  // Verificar tema inicial
  checkThemeFromWhatsApp();
  
  // Configurar observador para mudanças na árvore DOM
  const themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' || 
          (mutation.type === 'childList' && mutation.addedNodes.length > 0)) {
        checkThemeFromWhatsApp();
        break;
      }
    }
  });
  
  // Observar o corpo do documento para mudanças
  themeObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['class', 'data-theme', 'style']
  });
  
  // Verificar periodicamente também
  setInterval(checkThemeFromWhatsApp, 1000);
}

// Função para agendar mensagens
async function scheduleMessage(message, time) {
  try {
    // Garante que as guias estejam visíveis
    ensureInterfaceVisibility();

    // Valida a licença
    const result = await validateLicense(
      data_license.unique_id,
      data_license.phone,
      data_license.license
    );

    if (!result.success) {
      console.log('Licença inválida');
      return false;
    }

    // Salva a mensagem agendada
    const scheduledMessages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
    scheduledMessages.push({
      message,
      time,
      status: 'pending'
    });
    localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));

    // Atualiza a interface
    updateScheduleInterface();

    // Inicia o sistema de verificação se ainda não estiver rodando
    if (!window.scheduleCheckInterval) {
      startScheduleCheck();
    }

    return true;
  } catch (error) {
    console.error('Erro ao agendar mensagem:', error);
    return false;
  }
}

// Função para verificar e enviar mensagens agendadas
function startScheduleCheck() {
  // Verifica a cada minuto
  window.scheduleCheckInterval = setInterval(async () => {
    try {
      const scheduledMessages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
      const now = new Date().getTime();

      for (let i = 0; i < scheduledMessages.length; i++) {
        const msg = scheduledMessages[i];
        const scheduledTime = new Date(msg.time).getTime();

        if (msg.status === 'pending' && now >= scheduledTime) {
          // Atualiza o status para enviando
          msg.status = 'sending';
          localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));
          updateScheduleInterface();

          try {
            // Simula o envio da mensagem
            await sendToWhatsApp(msg.message);
            
            // Atualiza o status para enviado
            msg.status = 'sent';
            localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));
            updateScheduleInterface();
          } catch (error) {
            console.error('Erro ao enviar mensagem agendada:', error);
            msg.status = 'failed';
            localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));
            updateScheduleInterface();
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar mensagens agendadas:', error);
    }
  }, 60000); // Verifica a cada minuto
}

// Função para enviar mensagem ao WhatsApp
async function sendToWhatsApp(message) {
  // Simula o envio da mensagem
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mensagem enviada:', message);
      resolve();
    }, 1000);
  });
}

function updateScheduleInterface() {
  const scheduleContainer = document.querySelector('.schedule-container');
  if (!scheduleContainer) return;

  const scheduledMessages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
  
  // Atualiza a lista de mensagens agendadas
  const messagesList = scheduleContainer.querySelector('.messages-list');
  if (messagesList) {
    messagesList.innerHTML = scheduledMessages.map(msg => `
      <div class="scheduled-message ${msg.status}">
        <div class="message-content">${msg.message}</div>
        <div class="message-time">${new Date(msg.time).toLocaleString()}</div>
        <div class="message-status">${msg.status}</div>
      </div>
    `).join('');
  }
}

// Inicia o sistema de verificação quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  if (!window.scheduleCheckInterval) {
    startScheduleCheck();
  }
});

// Função para carregar grupos no Kanban
async function loadGroupsToKanban() {
  try {
    console.log('Iniciando carregamento de grupos no Kanban...');
    
    // Primeiro, tente encontrar o container do Kanban
    const possibleContainers = [
      document.querySelector('.kanban-container'),
      document.querySelector('[data-testid="web-kanban-container"]'),
      document.querySelector('.web-kanban-container'),
      document.querySelector('[data-testid="admin-panel-kanban"]'),
      document.querySelector('.custom-kanban-container-board'),
      document.querySelector('.admin-panel-kanban'),
      document.querySelector('.dashboard-kanban-container')
    ];
    
    // Encontrar o primeiro container válido
    const kanbanContainer = possibleContainers.find(container => container);
    
    if (!kanbanContainer) {
      console.log('Container do Kanban não encontrado, aguardando 3 segundos...');
      setTimeout(loadGroupsToKanban, 3000);
      return;
    }
    
    console.log('Container do Kanban encontrado:', kanbanContainer);

    // Criar coluna de grupos se não existir
    let groupsColumn = kanbanContainer.querySelector('.groups-column');
    if (!groupsColumn) {
      console.log('Criando coluna de grupos...');
      groupsColumn = document.createElement('div');
      groupsColumn.className = 'groups-column kanban-column';
      groupsColumn.innerHTML = `
        <div class="column-header">
          <h3>Grupos e Comunidades</h3>
        </div>
        <div class="column-content"></div>
      `;
      
      // Inserir no início ou em uma posição específica dependendo da estrutura
      if (kanbanContainer.firstChild) {
        kanbanContainer.insertBefore(groupsColumn, kanbanContainer.firstChild);
      } else {
        kanbanContainer.appendChild(groupsColumn);
      }
      
      console.log('Coluna de grupos criada e anexada ao Kanban');
    }

    // Cria uma promessa para resolver depois que os grupos forem encontrados
    const findGroups = async () => {
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        console.log(`Tentativa ${attempts + 1} de encontrar grupos...`);
        const groups = await getWhatsAppGroups();
        
        if (groups && groups.length > 0) {
          console.log(`Encontrados ${groups.length} grupos!`);
          return groups;
        }
        
        console.log('Nenhum grupo encontrado, aguardando 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
      
      console.log('Não foi possível encontrar grupos após várias tentativas');
      return [];
    };
    
    // Buscar grupos do WhatsApp com várias tentativas
    console.log('Iniciando busca por grupos do WhatsApp...');
    const groups = await findGroups();
    
    if (groups.length === 0) {
      console.log('Nenhum grupo encontrado após várias tentativas');
    }
    
    // Limpar conteúdo existente
    const columnContent = groupsColumn.querySelector('.column-content');
    if (columnContent) {
      columnContent.innerHTML = '';
      
      if (groups.length === 0) {
        // Adicionar mensagem de que nenhum grupo foi encontrado
        const noGroupsMessage = document.createElement('div');
        noGroupsMessage.className = 'no-groups-message';
        noGroupsMessage.textContent = 'Nenhum grupo encontrado. Certifique-se de ter grupos em seu WhatsApp.';
        columnContent.appendChild(noGroupsMessage);
      } else {
        // Adicionar grupos à coluna
        groups.forEach(group => {
          console.log('Adicionando grupo:', group.name);
          const groupCard = document.createElement('div');
          groupCard.className = 'kanban-card group-card';
          groupCard.draggable = true;
          groupCard.innerHTML = `
            <div class="card-header">
              <span class="group-name">${group.name}</span>
            </div>
            <div class="card-content">
              <span class="group-members">${group.participants}</span>
              <div class="last-message">
                <span class="message-text">${group.lastMessage}</span>
                <span class="message-time">${group.lastMessageTime}</span>
              </div>
            </div>
          `;

          // Adicionar eventos de drag and drop
          groupCard.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', group.id);
            groupCard.classList.add('dragging');
          });

          groupCard.addEventListener('dragend', () => {
            groupCard.classList.remove('dragging');
          });

          columnContent.appendChild(groupCard);
        });
        
        console.log('Grupos adicionados com sucesso ao Kanban');
      }
    } else {
      console.error('Elemento column-content não encontrado dentro da coluna de grupos');
    }

  } catch (error) {
    console.error('Erro ao carregar grupos:', error);
  }
}

// Função para buscar grupos do WhatsApp - versão melhorada
async function getWhatsAppGroups() {
  try {
    console.log('Buscando grupos do WhatsApp...');
    
    // Aguardar um momento para garantir que os elementos estão carregados
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Tentar diferentes seletores para encontrar conversas
    let conversations = [];
    
    // 1. Verificar o painel lateral
    const paneElement = document.getElementById('pane-side');
    if (!paneElement) {
      console.log('Painel lateral não encontrado');
      return [];
    }
    
    // Métodos para encontrar conversas
    const selectors = [
      '#pane-side [role="row"]',
      '#pane-side div[data-testid="cell-frame-container"]',
      '#pane-side div[data-testid="chat-list-item"]',
      '#pane-side div[aria-relevant="additions text"]',
      '#pane-side div[data-id]',
      '#pane-side div.lhggkp7q.ln8gz9je.rx9719la',
      '#pane-side [aria-label*="conversas"]',
      '#pane-side div[style*="height"][style*="opacity"]'
    ];
    
    // Tentar cada seletor até encontrar conversas
    for (let i = 0; i < selectors.length; i++) {
      conversations = document.querySelectorAll(selectors[i]);
      console.log(`Seletor ${i+1}: ${selectors[i]} - Encontradas ${conversations.length} conversas`);
      
      if (conversations.length > 0) {
        break;
      }
    }
    
    // Se ainda não encontrou, tentar uma abordagem diferente
    if (conversations.length === 0) {
      console.log('Tentando método alternativo para encontrar conversas...');
      // Pegar todos os divs dentro do painel que podem ser conversas
      conversations = Array.from(paneElement.querySelectorAll('div'))
        .filter(div => {
          const rect = div.getBoundingClientRect();
          // Conversas geralmente têm uma altura específica
          return rect.height > 60 && rect.height < 80 && div.children.length > 0;
        });
      
      console.log(`Método alternativo: Encontradas ${conversations.length} possíveis conversas`);
    }
    
    const groups = [];
    let conversationArray = Array.from(conversations);
    
    for (let i = 0; i < conversationArray.length; i++) {
      const conv = conversationArray[i];
      try {
        // Métodos para identificar grupos
        const isGroup = 
          // Método 1: Verificar ícones específicos de grupo
          conv.querySelector('[data-testid="default-group"], [data-icon="default-group"]') || 
          conv.querySelector('[data-testid="default-community"], [data-icon="default-community"]') ||
          conv.querySelector('span[data-icon="group"]') ||
          // Método 2: Verificar imagens de grupo
          conv.querySelector('img[src*="group"], img[src*="community"]') ||
          // Método 3: Verificar texto indicando participantes
          (conv.textContent && (
            conv.textContent.includes('participante') || 
            conv.textContent.includes('membros') ||
            conv.textContent.includes('members')
          ));
        
        if (isGroup) {
          console.log('Grupo detectado:', conv);
          
          // Métodos para extrair informações do grupo
          // 1. Tente encontrar o nome do grupo
          let nameElement = 
            conv.querySelector('[data-testid="chat-list-title"]') ||
            conv.querySelector('[title]') ||
            conv.querySelector('span.ggj6brxn') ||
            conv.querySelector('div.y_sn4') ||
            conv.querySelector('span[dir="auto"]');
          
          // 2. Tente encontrar a informação de participantes
          let participantsElement = 
            conv.querySelector('span[title*="participante"]') ||
            conv.querySelector('span[title*="member"]') ||
            conv.querySelector('span.l7jjieqr');
          
          // 3. Tente encontrar a última mensagem
          let lastMessageElement = 
            conv.querySelector('[data-testid="last-msg-status"]') ||
            conv.querySelector('[data-testid="conversation-info-header-chat-title"]') ||
            conv.querySelector('div[data-pre-plain-text]') ||
            conv.querySelector('span.previews-text');
          
          // 4. Tente encontrar o horário da mensagem
          let timeElement = 
            conv.querySelector('[data-testid="last-msg-time"]') ||
            conv.querySelector('div[aria-label*="hora"]') ||
            conv.querySelector('div[aria-label*="ontem"]') ||
            conv.querySelector('div[aria-label*="dia"]') ||
            conv.querySelector('span.l7jjieqr');
          
          // Extrair textos
          const name = nameElement 
            ? (nameElement.textContent || nameElement.getAttribute('title') || 'Grupo') 
            : 'Grupo ' + (i + 1);
            
          const participants = participantsElement 
            ? (participantsElement.textContent || participantsElement.getAttribute('title') || '') 
            : '';
            
          const lastMessage = lastMessageElement 
            ? lastMessageElement.textContent 
            : '';
            
          const lastMessageTime = timeElement 
            ? (timeElement.textContent || timeElement.getAttribute('aria-label') || '') 
            : '';
          
          // Calcular índice para ordenação (lista invertida)
          const index = conversationArray.indexOf(conv);
          
          console.log('Grupo encontrado:', { name, participants, lastMessage, lastMessageTime, index });
          
          groups.push({
            id: `group-${groups.length + 1}`,
            name,
            participants,
            lastMessage,
            lastMessageTime,
            timestamp: 999999 - index // Usar o índice invertido para ordem original
          });
        }
      } catch (err) {
        console.error('Erro ao processar conversa:', err);
      }
    }
    
    console.log('Total de grupos encontrados:', groups.length);
    
    // Ordenar grupos pela ordem original (timestamp ou índice)
    return groups.sort((a, b) => b.timestamp - a.timestamp);
    
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}

// Função para detectar quando o Kanban é aberto e carregar os grupos
function setupKanbanDetection() {
  console.log('Configurando detecção do Kanban...');
  
  // 1. Método mais moderno com IntersectionObserver para verificar quando o Kanban aparece na tela
  try {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const kanbanContainer = entry.target;
          console.log('Kanban detectado via IntersectionObserver:', kanbanContainer);
          
          if (!kanbanContainer.hasAttribute('data-groups-loaded')) {
            kanbanContainer.setAttribute('data-groups-loaded', 'true');
            loadGroupsToKanban();
          }
        }
      });
    }, { threshold: 0.1 });
    
    // Observar elementos existentes e futuros com verificação periódica
    setInterval(() => {
      document.querySelectorAll('.kanban-container, [data-testid="web-kanban-container"], .custom-kanban-container-board, .admin-panel-kanban').forEach(container => {
        if (!container.hasAttribute('data-observer-attached')) {
          observer.observe(container);
          container.setAttribute('data-observer-attached', 'true');
          console.log('Container do Kanban observado:', container);
        }
      });
    }, 2000);
  } catch (e) {
    console.error('Erro ao configurar IntersectionObserver:', e);
  }
  
  // 2. Método com verificação periódica (backup)
  setInterval(() => {
    const kanbanContainer = document.querySelector('.kanban-container, [data-testid="web-kanban-container"], .custom-kanban-container-board, .admin-panel-kanban');
    if (kanbanContainer && !kanbanContainer.hasAttribute('data-groups-loaded')) {
      console.log('Kanban detectado via intervalo:', kanbanContainer);
      kanbanContainer.setAttribute('data-groups-loaded', 'true');
      loadGroupsToKanban();
    }
  }, 3000);
  
  // 3. Detectar clique no botão do Kanban
  document.addEventListener('click', event => {
    const kanbanButton = document.querySelector('#kanban_board');
    if (event.target === kanbanButton || kanbanButton?.contains(event.target)) {
      console.log('Clique no botão do Kanban detectado');
      setTimeout(() => {
        loadGroupsToKanban();
      }, 1000);
    }
  }, true);
  
  console.log('Detecção do Kanban configurada com sucesso');
}

// Iniciar a detecção do Kanban quando o WhatsApp Web estiver carregado
const whatsAppReadyCheck = setInterval(() => {
  if (document.getElementById('pane-side')) {
    clearInterval(whatsAppReadyCheck);
    console.log('WhatsApp Web carregado, configurando detecção do Kanban...');
    setupKanbanDetection();
  }
}, 1000);

// Iniciar as funções quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - Inicializando funções do Kanban...');
  setupKanbanDetection();
});

// Inicializar imediatamente se o documento já estiver carregado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Documento já carregado - Inicializando funções do Kanban...');
  setupKanbanDetection();
}

// Também configurar verificação para quando o botão do Kanban for adicionado ao DOM
const checkKanbanButton = setInterval(() => {
  const kanbanButton = document.querySelector('#kanban_board');
  if (kanbanButton) {
    clearInterval(checkKanbanButton);
    console.log('Botão do Kanban encontrado, configurando evento de clique...');
    
    kanbanButton.addEventListener('click', () => {
      console.log('Botão do Kanban clicado, carregando grupos...');
      setTimeout(() => {
        loadGroupsToKanban();
      }, 1000);
    });
    
    // Também verificar se o Kanban já está aberto
    setTimeout(() => {
      const kanbanContainer = document.querySelector('.kanban-container, [data-testid="web-kanban-container"], .custom-kanban-container-board, .admin-panel-kanban');
      if (kanbanContainer) {
        console.log('Kanban já aberto, carregando grupos...');
        loadGroupsToKanban();
      }
    }, 1000);
  }
}, 1000);
