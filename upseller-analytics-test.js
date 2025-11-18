console.log('Config File: default.js - default client config file loaded');

const SVG_Thumb = `<svg width="24px" height="24px" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="currentColor"></path></svg>`


//set other config params here
//window['_Up']._nocache = true;





  // This runs in the same page where you include the VF widget
  const TraceLoggerExtension = {
    name: 'TraceLogger',
    type: 'effect', // <- no UI, just side-effects

    // Decide which traces you care about
    match: ({ trace }) => trace.type === 'ext_feedback_btns' || trace.payload?.name === 'ext_feedback_btns',
    // or: match: () => true; // to log everything

    effect: ({ trace }) => {
      console.log('[Upseller Analytics] Feedback captured:', trace);

      // later: send to analytics
      // analytics.track('vf_trace', trace);
    }
  };


  const FeedbackExtension = {
  name: 'Feedback',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_feedback_icons' || trace.payload?.name === 'ext_feedback_icons',
  render: ({ trace, element }) => {
    const feedbackContainer = document.createElement('div')

    feedbackContainer.innerHTML = `
          <style>
            .vfrc-feedback {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .vfrc-feedback--description {
                font-size: 0.8em;
                color: grey;
                pointer-events: none;
            }

            .vfrc-feedback--buttons {
                display: flex;
            }

            .vfrc-feedback--button {
                margin: 0;
                padding: 0;
                margin-left: 0px;
                border: none;
                background: none;
                opacity: 0.2;
            }

            .vfrc-feedback--button:hover {
              opacity: 0.5; /* opacity on hover */
            }

            .vfrc-feedback--button.selected {
              opacity: 0.6;
            }

            .vfrc-feedback--button.disabled {
                pointer-events: none;
            }

            .vfrc-feedback--button:first-child svg {
                fill: none; /* color for thumb up */
                stroke: none;
                border: none;
                margin-left: 6px;
            }

            .vfrc-feedback--button:last-child svg {
                margin-left: 4px;
                fill: none; /* color for thumb down */
                stroke: none;
                border: none;
                transform: rotate(180deg);
            }
          </style>
          <div class="vfrc-feedback">
            <div class="vfrc-feedback--description">Oliko palvelu hyödyllinen?</div>
            <div class="vfrc-feedback--buttons">
              <button class="vfrc-feedback--button" data-feedback="1">${SVG_Thumb}</button>
              <button class="vfrc-feedback--button" data-feedback="0">${SVG_Thumb}</button>
            </div>
          </div>
        `

    feedbackContainer
      .querySelectorAll('.vfrc-feedback--button')
      .forEach((button) => {
        button.addEventListener('click', function (event) {
          const feedback = this.getAttribute('data-feedback')
          // window.voiceflow.chat.interact({
          //   type: 'complete',
          //   payload: { feedback: feedback },
          // })
          console.log('[Upseller Analytics] User feedback submitted:', feedback);

          feedbackContainer
            .querySelectorAll('.vfrc-feedback--button')
            .forEach((btn) => {
              btn.classList.add('disabled')
              if (btn === this) {
                btn.classList.add('selected')
              }
            })
        })
      })

    element.appendChild(feedbackContainer)
  },
};


//load voiceflow embed script here


  (function(d, t) {
      var v = d.createElement(t), s = d.getElementsByTagName(t)[0];
      v.onload = function() {
        window.voiceflow.chat.load({
          verify: { projectID: '68f9dca7b9abe8c36ec96e77' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          assistant: {
            extensions: [TraceLoggerExtension, FeedbackExtension] // your extension's name goes here
          },
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
      }
      v.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"; v.type = "text/javascript"; s.parentNode.insertBefore(v, s);
  })(document, 'script');



//run other scripts here

const UPS_ANALYTICS_URL = 'https://upseller-analytics.vercel.app/api/events';
const UPS_EVENT_TOKEN = 'test_sandbox_write_token_123';
const VF_TEST_PROJECT_ID = '68f9dca7b9abe8c36ec96e77';
const VF_WIDGET_HOST_SELECTOR = '#voiceflow-chat';

async function sendWidgetEvent(eventName, props = {}) {
  try {
    console.log('[Upseller Analytics] Sending event:', eventName, props);
    await fetch(UPS_ANALYTICS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${UPS_EVENT_TOKEN}`,
      },
      body: JSON.stringify({
        events: [
          {
            event_id: crypto.randomUUID(),
            event_name: eventName,
            occurred_at: new Date().toISOString(),
            project_id: VF_TEST_PROJECT_ID,
            properties: props,
          },
        ],
      }),
    });
  } catch (error) {
    console.error('[Upseller Analytics] Failed to send', eventName, error);
  }
}

function trackWidgetSeenOnce() {
  if (window.__upsellerWidgetSeen) return;
  console.log('[Upseller Analytics] Widget seen detected');
  window.__upsellerWidgetSeen = true;
  sendWidgetEvent('widget_seen', { page: window.location.pathname });
}

function findVoiceflowWidget() {
  const host = document.querySelector(VF_WIDGET_HOST_SELECTOR);
  if (!host) {
    console.log('[Upseller Analytics] Widget host not found yet');
    return null;
  }

  if (host.shadowRoot) {
    return host.shadowRoot.querySelector('.vfrc-widget');
  }

  return host;
}

window.addEventListener('load', () => {
  const initialWidget = findVoiceflowWidget();
  if (initialWidget) {
    console.log('[Upseller Analytics] Widget already present on load');
    trackWidgetSeenOnce();
    return;
  }

  const observer = new MutationObserver(() => {
    const widgetEl = findVoiceflowWidget();

    if (widgetEl) {
      console.log('[Upseller Analytics] Widget detected via MutationObserver');
      trackWidgetSeenOnce();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
