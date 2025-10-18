//Форма
function formFieldsInit(options = { viewPass: true, autoHeight: false }) {
  document.body.addEventListener("focusin", function (e) {
    const targetElement = e.target;
    if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
      if (!targetElement.hasAttribute('data-no-focus-classes')) {
        targetElement.classList.add('_form-focus');
        targetElement.parentElement.classList.add('_form-focus');
      }
      formValidate.removeError(targetElement);
      targetElement.hasAttribute('data-validate') ? formValidate.removeError(targetElement) : null;
    }
  });
  document.body.addEventListener("focusout", function (e) {
    const targetElement = e.target;
    if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
      if (!targetElement.hasAttribute('data-no-focus-classes')) {
        targetElement.classList.remove('_form-focus');
        targetElement.parentElement.classList.remove('_form-focus');
      }
      targetElement.hasAttribute('data-validate') ? formValidate.validateInput(targetElement) : null;
    }
  });
  if (options.viewPass) {
    document.addEventListener("click", function (e) {
      const targetElement = e.target;
      if (targetElement.closest('.form__viewpass')) {
        const viewpassBlock = targetElement.closest('.form__viewpass');
        const input = viewpassBlock.closest('.form__input').querySelector('input');

        if (input) {
          const isActive = viewpassBlock.classList.contains('_viewpass-active');
          input.setAttribute("type", isActive ? "password" : "text");
          viewpassBlock.classList.toggle('_viewpass-active');
        } else {
          console.error('Input не найден!');
        }
      }
    });
  }
  if (options.autoHeight) {
    const textareas = document.querySelectorAll('textarea[data-autoheight]');
    if (textareas.length) {
      textareas.forEach(textarea => {
        const startHeight = textarea.hasAttribute('data-autoheight-min') ?
          Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
        const maxHeight = textarea.hasAttribute('data-autoheight-max') ?
          Number(textarea.dataset.autoheightMax) : Infinity;
        setHeight(textarea, Math.min(startHeight, maxHeight))
        textarea.addEventListener('input', () => {
          if (textarea.scrollHeight > startHeight) {
            textarea.style.height = `auto`;
            setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
          }
        });
      });
      function setHeight(textarea, height) {
        textarea.style.height = `${height}px`;
      }
    }
  }
}
formFieldsInit({
  viewPass: true,
  autoHeight: false
});
let formValidate = {
  getErrors(form) {
    let error = 0;
    let formRequiredItems = form.querySelectorAll('*[data-required]');
    if (formRequiredItems.length) {
      formRequiredItems.forEach(formRequiredItem => {
        if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
          error += this.validateInput(formRequiredItem);
        }
      });
    }
    return error;
  },
  validateInput(formRequiredItem) {
    let error = 0;

    if (formRequiredItem.dataset.required === "email") {
      formRequiredItem.value = formRequiredItem.value.replace(" ", "");
      if (this.emailTest(formRequiredItem)) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
      this.addError(formRequiredItem);
      this.removeSuccess(formRequiredItem);
      error++;
    } else if (formRequiredItem.dataset.validate === "password-confirm") {
      // Проверяем, совпадает ли пароль с полем #password
      const passwordInput = document.getElementById('password');
      if (!passwordInput) return error;

      if (formRequiredItem.value !== passwordInput.value) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    } else {
      if (!formRequiredItem.value.trim()) {
        this.addError(formRequiredItem);
        this.removeSuccess(formRequiredItem);
        error++;
      } else {
        this.removeError(formRequiredItem);
        this.addSuccess(formRequiredItem);
      }
    }

    return error;
  },
  addError(formRequiredItem) {
    formRequiredItem.classList.add('_form-error');
    formRequiredItem.parentElement.classList.add('_form-error');
    let inputError = formRequiredItem.parentElement.querySelector('.form__error');
    if (inputError) formRequiredItem.parentElement.removeChild(inputError);
    if (formRequiredItem.dataset.error) {
      formRequiredItem.parentElement.insertAdjacentHTML('beforeend', `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
    }
  },
  removeError(formRequiredItem) {
    formRequiredItem.classList.remove('_form-error');
    formRequiredItem.parentElement.classList.remove('_form-error');
    if (formRequiredItem.parentElement.querySelector('.form__error')) {
      formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector('.form__error'));
    }
  },
  addSuccess(formRequiredItem) {
    formRequiredItem.classList.add('_form-success');
    formRequiredItem.parentElement.classList.add('_form-success');
  },
  removeSuccess(formRequiredItem) {
    formRequiredItem.classList.remove('_form-success');
    formRequiredItem.parentElement.classList.remove('_form-success');
  },
  formClean(form) {
    form.reset();
    setTimeout(() => {
      let inputs = form.querySelectorAll('input,textarea');
      for (let index = 0; index < inputs.length; index++) {
        const el = inputs[index];
        el.parentElement.classList.remove('_form-focus');
        el.classList.remove('_form-focus');
        formValidate.removeError(el);
      }
      let checkboxes = form.querySelectorAll('.checkbox__input');
      if (checkboxes.length > 0) {
        for (let index = 0; index < checkboxes.length; index++) {
          const checkbox = checkboxes[index];
          checkbox.checked = false;
        }
      }
      if (flsModules.select) {
        let selects = form.querySelectorAll('div.select');
        if (selects.length) {
          for (let index = 0; index < selects.length; index++) {
            const select = selects[index].querySelector('select');
            flsModules.select.selectBuild(select);
          }
        }
      }
    }, 0);
  },
  emailTest(formRequiredItem) {
    return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
  }
};
function formSubmit() {
  const forms = document.forms;
  if (forms.length) {
    for (const form of forms) {
      form.addEventListener('submit', function (e) {
        const form = e.target;
        formSubmitAction(form, e);
      });
      form.addEventListener('reset', function (e) {
        const form = e.target;
        formValidate.formClean(form);
      });
    }
  }
  async function formSubmitAction(form, e) {
    const error = !form.hasAttribute('data-no-validate') ? formValidate.getErrors(form) : 0;
    if (error === 0) {
      const ajax = form.hasAttribute('data-ajax');
      if (ajax) {
        e.preventDefault();
        const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
        const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
        const formData = new FormData(form);

        form.classList.add('_sending');
        const response = await fetch(formAction, {
          method: formMethod,
          body: formData
        });
        if (response.ok) {
          let responseResult = await response.json();
          form.classList.remove('_sending');
          formSent(form, responseResult);
        } else {
          alert("Помилка");
          form.classList.remove('_sending');
        }
      } else if (form.hasAttribute('data-dev')) {
        e.preventDefault();
        formSent(form);
      }
    } else {
      e.preventDefault();
      if (form.querySelector('._form-error') && form.hasAttribute('data-goto-error')) {
        const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : '._form-error';
        gotoBlock(formGoToErrorClass, true, 1000);
      }
    }
  }
  function formSent(form, responseResult = ``) {
    document.dispatchEvent(new CustomEvent("formSent", {
      detail: {
        form: form
      }
    }));
    setTimeout(() => {
      if (flsModules.popup) {
        const popup = form.dataset.popupMessage;
        popup ? flsModules.popup.open(popup) : null;
      }
    }, 0);
    formValidate.formClean(form);
    formLogging(`Формa отправлена!`);
  }
  function formLogging(message) {
    FLS(`[Формa]: ${message}`);
  }
}
formSubmit()

//Слайдер
if (document.querySelector('.block-benefits__slider')) {
  const swiperBenefits = new Swiper('.block-benefits__slider', {
    observer: true,
    observeParents: true,
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 400,
    navigation: {
      prevEl: '.block-benefits__arrow-prev',
      nextEl: '.block-benefits__arrow-next',
    },
  });
}
if (document.querySelector('.block-benefits2__slider')) {
  const swiperBenefits = new Swiper('.block-benefits2__slider', {
    observer: true,
    observeParents: true,
    slidesPerView: 1.1,
    spaceBetween: 10,
    speed: 400,
    breakpoints: {
      400: {
        slidesPerView: 1.3,
        spaceBetween: 10,
      },
      550: {
        slidesPerView: 1.8,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 10,
      },
      992: {
        slidesPerView: 3.2,
        spaceBetween: 10,
      },
      1200: {
        slidesPerView: 3.5,
        spaceBetween: 20,
      },
      1400: {
        slidesPerView: 4,
        spaceBetween: 30,
      },
    },
  });
}
if (document.querySelector('.block-scope-application__slider')) {
  const swiperScopeApplication = new Swiper('.block-scope-application__slider', {
    observer: true,
    observeParents: true,
    slidesPerView: 1.3,
    spaceBetween: 10,
    speed: 400,
    navigation: {
      prevEl: '.block-scope-application__arrow-prev',
      nextEl: '.block-scope-application__arrow-next',
    },
    breakpoints: {
      480: {
        slidesPerView: 1.7,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 2.3,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
}
document.querySelectorAll('.block-section__slider').forEach((slider, index) => {
  const swiperSection = new Swiper(slider, {
    observer: true,
    observeParents: true,
    slidesPerView: 1.3,
    spaceBetween: 10,
    speed: 400,
    navigation: {
      prevEl: slider.closest('.block-section').querySelector('.block-section__arrow-prev'),
      nextEl: slider.closest('.block-section').querySelector('.block-section__arrow-next'),
    },
    breakpoints: {
      480: {
        slidesPerView: 1.7,
        spaceBetween: 10,
      },
      768: {
        slidesPerView: 2.5,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });
});
if (document.querySelector('.block-brands-filter__slider')) {
  const slider = document.querySelector('.block-brands-filter__slider');
  const wrapper = document.querySelector('.block-brands-filter__wrapper');
  const slides = document.querySelectorAll('.block-brands-filter__slide');

  slides.forEach(slide => {
    const clone = slide.cloneNode(true);
    wrapper.appendChild(clone);
  });

  let position = 0;
  let animationId;
  const speed = 0.5; // Скорость прокрутки (пикселей за кадр)

  function animate() {
    position -= speed;

    const wrapperWidth = wrapper.scrollWidth / 2;
    if (Math.abs(position) >= wrapperWidth) {
      position = 0;
    }

    wrapper.style.transform = `translateX(${position}px)`;
    animationId = requestAnimationFrame(animate);
  }

  animate();

  slider.addEventListener('mouseenter', () => {
    cancelAnimationFrame(animationId);
  });

  slider.addEventListener('mouseleave', () => {
    animate();
  });
}

Fancybox.bind("[data-fancybox]", {
  // опции
});

//Маска телефон
const telephone = document.querySelectorAll(".tel");
if (telephone) Inputmask({
  mask: "+7 (999) - 999 - 99 - 99"
}).mask(telephone);

const filterContainers = document.querySelectorAll('[data-filters]');
if (filterContainers) {
  const swiperInstances = {};
  function initSwipers() {
    if (document.querySelector('.block-news-bottom__slider')) {
      swiperInstances.news = new Swiper('.block-news-bottom__slider', {
        observer: true,
        observeParents: true,
        autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 10,
        breakpoints: {
          550: {
            slidesPerView: 1.3,
            spaceBetween: 10,
          },
          700: {
            slidesPerView: 1.6,
            spaceBetween: 10,
          },
          992: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          1400: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        },
      });
    }

    if (document.querySelector('.block-brands__slider')) {
      swiperInstances.brands = new Swiper('.block-brands__slider', {
        observer: true,
        observeParents: true,
        autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 10,
        breakpoints: {
          550: {
            slidesPerView: 1.5,
            spaceBetween: 10,
          },
          700: {
            slidesPerView: 2.5,
            spaceBetween: 10,
          },
          992: {
            slidesPerView: 3.5,
            spaceBetween: 15,
          },
          1400: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        },
      });
    }
  }
  function updateSwipers() {
    if (swiperInstances.news) {
      swiperInstances.news.update();
      swiperInstances.news.updateAutoHeight();
      swiperInstances.news.slideTo(0);
    }

    if (swiperInstances.brands) {
      swiperInstances.brands.update();
      swiperInstances.brands.updateAutoHeight();
      swiperInstances.brands.slideTo(0);
    }
  }
  function initFilters() {

    filterContainers.forEach(container => {
      const filterButtons = container.querySelectorAll('.filter-title');
      const filterBlocks = container.querySelectorAll('.filter-block');

      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const filterValue = button.getAttribute('data-filter');

          filterButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          filterBlocks.forEach(block => {
            const blockFilter = block.getAttribute('data-filter');

            if (filterValue === 'all' || blockFilter === filterValue) {
              block.classList.remove('hide');
            } else {
              block.classList.add('hide');
            }
          });

          updateSwipers();
        });
      });
    });
  }
  initSwipers();
  initFilters();
}

document.addEventListener('DOMContentLoaded', function () {
  const menuIcon = document.querySelector('.icon-menu');
  const menuBody = document.querySelector('.menu__body');
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu');

  function openMenu() {
    document.documentElement.classList.add('menu-open');
  }

  function closeMenu() {
    document.documentElement.classList.remove('menu-open');
  }

  function isMenuOrHeader(element) {
    return header.contains(element) || menu.contains(element);
  }

  menuIcon.addEventListener('click', function (e) {
    e.stopPropagation();

    if (document.documentElement.classList.contains('menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (document.documentElement.classList.contains('menu-open') &&
      !isMenuOrHeader(e.target)) {
      closeMenu();
    }
  });

  const menuLinks = menuBody.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });
});