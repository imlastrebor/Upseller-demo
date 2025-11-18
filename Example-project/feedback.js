const SVG_Thumb = `<svg width="24px" height="24px" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="currentColor"></path></svg>`;

export const removePreviousFeedbackElements = () => {
  document
    .querySelector("#voiceflow-chat")
    .shadowRoot.querySelectorAll(".vfrc-feedback-container")
    .forEach((el) => el.remove());
};

// Function to render the feedback UI
export const renderFeedbackUI = (messageElement) => {
  removePreviousFeedbackElements();
  const thumbUpSVG = SVG_Thumb.replace(
    'fill="currentColor"',
    'fill="rgba(33, 69, 33, 0.7)"'
  );

  const thumbDownSVG = SVG_Thumb.replace(
    'fill="currentColor"',
    'fill="rgba(105, 22, 22, 0.7)"'
  );

  const feedbackContainer = document.createElement("div");
  feedbackContainer.classList.add("vfrc-feedback-container");
  feedbackContainer.innerHTML = `
          <style>
            .vfrc-feedback {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                margin-top: 8px;
            }

            .vfrc-feedback--buttons {
                display: flex;
                gap: 8px;
            }

            .vfrc-feedback--button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 1px solid rgba(0, 0, 0, 0.08);
                background: #ffffff;
                transition: all 0.2s ease;
                cursor: pointer;
                padding: 6px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }

            .vfrc-feedback--button:hover {
                background: #f8f8f8;
                transform: translateY(-2px);
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
            }

            .vfrc-feedback--button.selected {
                opacity: 1;
                transform: scale(1.05);
            }

            .vfrc-feedback--button.selected[data-feedback="1"] {
                background: #f3f9f3;
                border-color: rgba(76, 175, 80, 0.3);
                box-shadow: 0 2px 6px rgba(76, 175, 80, 0.2);
            }

            .vfrc-feedback--button.selected[data-feedback="0"] {
                background: #fdf5f5;
                border-color: rgba(244, 67, 54, 0.3);
                box-shadow: 0 2px 6px rgba(244, 67, 54, 0.2);
            }

            .vfrc-feedback--button svg {
                width: 18px;
                height: 18px;
                transition: all 0.2s ease;
            }

            .vfrc-feedback--button[data-feedback="1"] svg {
                fill: rgba(76, 175, 80, 0.7);
                stroke: rgba(76, 175, 80, 0.1);
            }

            .vfrc-feedback--button[data-feedback="0"] svg {
                fill: rgba(244, 67, 54, 0.7);
                stroke: rgba(244, 67, 54, 0.1);
                transform: rotate(180deg);
            }

            .vfrc-feedback--button.selected[data-feedback="1"] svg {
                fill: rgb(76, 175, 80);
                stroke: rgba(76, 175, 80, 0.2);
            }

            .vfrc-feedback--button.selected[data-feedback="0"] svg {
                fill: rgb(244, 67, 54);
                stroke: rgba(244, 67, 54, 0.2);
                transform: rotate(180deg);
            }

            .vfrc-feedback--button.disabled {
                pointer-events: none;
            }
          </style>
          <div class="vfrc-feedback">
            <div class="vfrc-feedback--buttons">
              <button class="vfrc-feedback--button" data-feedback="1">${thumbUpSVG}</button>
              <button class="vfrc-feedback--button" data-feedback="0">${thumbDownSVG}</button>
            </div>
          </div>
        `;

  const allButtons = feedbackContainer.querySelectorAll(
    ".vfrc-feedback--button"
  );

  allButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const feedback = button.getAttribute("data-feedback");
      const emoji = feedback == 1 ? "👍" : "👎";

      allButtons.forEach((btn) => {
        btn.disabled = true;
        btn.classList.add("disabled");
      });

      button.classList.add("selected");

      window.voiceflow.chat.interact({
        type: `Feedback ${emoji}`,
        payload: { feedback: feedback },
      });
    });
  });

  messageElement.appendChild(feedbackContainer);
};
