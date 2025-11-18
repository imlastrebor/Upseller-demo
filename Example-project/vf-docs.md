# DM API

## Overview

The Dialog Manager API (DM API) allows any application to talk with a Voiceflow diagram using HTTP calls to the interact endpoint.

Managing your conversation state when using DM API
The DM API automatically creates and manages the conversation state. Identical requests to the DM API may produce different responses, depending on your diagram's logic and the previous request that the API received.

Note that this means the DM API is not a REST API as it does not satisfy the statelessness property. The DM API's responses depend not only on the request, but also stored state within the server. Keep this in mind while working with the DM API.

A diagram of how a conversation through the Dialog Management API works with example payloads, traces received, visual representations, and an example of how to integrate the Dialog Management API deeply into an app through a custom action.
A diagram of how a conversation through the Dialog Management API works with example payloads, traces received, visual representations, and an example of how to integrate the Dialog Management API deeply into an app through a custom action.

Tracking conversation state
All endpoints take in a userID parameter, which is used to identify the caller and assign them a unique conversation state object.

Multiple conversation sessions
Multiple conversation sessions to the same Voiceflow project can be running simultaneously. Each session is identified by the userID that you specify.

For example, customer A should communicate with /state/user/customerA/interact whereas customer B should communicate with /state/user/customerB/interact.

When customer A gives a response, such as "I would like a large pizza", it will advance their specific conversation session identified by /state/user/customerA/interact. For example, the app might then ask what toppings customer A wants.

Meanwhile, /state/user/customerB/interact's session remains unchanged, e.g, it might be waiting for customer B to give their order.

Format of userID
The format of userID is up to you. You can choose any string that fits your particular domain such as user1234 or 507f191e810c19729de860ea.

There are a few best practices to defining a userID format:

Unique - The userID should be unique to each user. Otherwise, if two users share the same userID, the Voiceflow app may leak information about user A's conversation to user B, which is a potential privacy violation.

Non-sensitive - It is not recommended to use sensitive or private information in the userID such
as emails, real names, or phone numbers.

versionID
DM API endpoints also accept a versionID header whose value is a version alias that points to a particular version of your Voiceflow project.

The currently supported aliases are:

development - The version displayed on the Voiceflow Creator's canvas

production - The version that has been published

Use the development alias whenever you are experimenting with your API, and the production version when integrating Voiceflow with your web app. Learn more about version and project IDs here.

Updating your version
To update the 'development' version exposed by the DM API, you must:

Make your changes on the canvas and NLU manager

Hit the blue Run button in the Voiceflow canvas to compile the diagram

Hit the "Train Assistant" button in the Prototype tool to train the NLU model

To update the 'production' version exposed by the DM API, you must:

Make your changes on the canvas and NLU manager

Hit the Publish button at the top-right corner of the Voiceflow canvas

## Trace Types

Overview
Flows in Voiceflow are a made of a variety of steps, and the steps have corresponding JSON traces. Step traces are used by Web Chat — and can be used by custom integrations — to determine what should be presented to the user upon events such as conversation launch, utterance submission, and button selection.

In short, traces represent every output from Voiceflow. The Dialog Manager API interact endpoint returns an array of trace objects.

All trace objects returned by the Dialog Manager API have a type attribute that identifies the type of element and a payload object with additional data such as a step’s response content or a button’s label.

They also all contain a time property indicating at what time the trace elements was created (the time that the step that created it actually ran) in the Epoch Unix Timestamp format. This timestamp can help you debug which steps inside your flow take a long time, since for example text steps come almost instantly, but AI generation steps could take a couple of second to create.

Below are key trace types that you will encounter.

type: text
This trace type is returned for the following Voiceflow elements:

Text Step
Response AI Step
No match re-prompt
No reply re-prompt
Global No Match
Global No Reply
Example payload:

JSON

{
  "type": "text",
  "time": 1720552033,
  "payload": {
    "slate": {
      "id": "", // unique string generated by Voiceflow
      "content": [
        {
          "children": [
            {
              "text": "Hello there!"
            }
          ]
        },
        {
          "children": [
            {
              "text": ""
            }
          ]
        },
        {
          "children": [
            {
              "text": "Select an option or ask me a question"
            }
          ]
        }
      ],
      "messageDelayMilliseconds": 1000 // default is 1000ms between responses
    },
    "message": "Hello there!\n\nSelect an option or ask me a question",
    "delay": 1000 // default is 1000ms between responses
  }
}
type: speak
This trace type is returned for the following Voiceflow elements:

Speak Step
Audio Step
No match reprompt
No reply reprompt
Global No Match
Global No Reply
Speak Step example:

The src value for Speak steps is a data URI generated by Voiceflow.

JSON

{
  "type": "speak",
  "time": 1720552033,
  "payload": {
    "message": "Hello there!",
    "type": "message",
    "src": "data:audio/mpeg;base64,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",
    "voice": "Ivy"
  }
}
Audio Step example:

The src value for Audio steps is a URL to the file and are generated by Voiceflow.

The message value will be an empty string for Audio steps.

JSON

{
  "type": "speak",
  "time": 1720552033,
  "payload": {
    "message": "",
    "type": "audio",
    "src": "https://s3.amazonaws.com/com.example.audio.production/example-file.mp3"
  }
}
type: visual
This trace type is returned for the following Voiceflow elements: Image Step.

The dimentions attribute value can be null.

JSON

{
  "type": "visual",
  "time": 1720552033,
  "payload": {
    "visualType": "image",
    "image": "https://assets-global.website-files.com/example-file.png",
    "dimensions": {
      "width": 800,
      "height": 800
    },
    "canvasVisibility": "full"
  }
}
type: cardV2
This trace type is returned for the following Voiceflow elements: Card Step.

When you encounter a trace with a button, take note of the button objects' request.type values. A request.type value is a Voiceflow-generated path ID for the next element, and will need to be included in the next request to the Dialog Manager API upon button click.

JSON

{
  "type": "cardV2",
  "time": 1720552033,
  "payload": {
    "imageUrl": "https://assets-global.website-files.com/example-file.png",
    "description": {
      "slate": [
        {
          "children": [
            {
              "text": "This is a Card description"
            }
          ]
        }
      ],
      "text": "This is a Card description"
    },
    "buttons": [
      {
        "name": "Click for next step",
        "request": {
          "type": "", // path ID generated by Voiceflow
          "payload": {
            "actions": [],
            "label": "Click for next step"
          }
        }
      }
    ],
    "title": "This is a Card title"
  }
}
type: no-reply
This trace type is returned for the following Voiceflow elements: No Reply.

This example trace is for a no-reply with a timeout set to 10 seconds:

JSON

{
  "type": "no-reply",
  "time": 1720552033,
  "payload": {
    "timeout": 10 // converted to seconds
  }
}
Note: If you encounter this trace, a No Reply setting was enabled. If the user does not complete an event (e.g. send a message) within the timeout specified, send another request to the Dialog Manager API to fetch the corresponding no-reply message. The request body format would be the below, and the returned trace type will be type: text:

JSON

{
  "request": {
    "type": "no-reply"
  }
}
type: carousel
This trace type is returned for the following Voiceflow elements: Carousel Step.

When you encounter a trace with a button, take note of the button objects' request.type values. A request.type value is a Voiceflow-generated path ID for the next element, and will need to be included in the next request to the Dialog Manager API upon button click.

This example trace is for a Carousel with two Cards:

JSON

{
  "type": "carousel",
  "time": 1720552033,
  "payload": {
    "layout": "Carousel",
    "cards": [
      {
        "id": "", // unique string generated by Voiceflow
        "title": "This is a Carousel card title",
        "description": {
          "slate": [
            {
              "children": [
                {
                  "text": "This is a Carousel card description"
                }
              ]
            }
          ],
          "text": "This is a Carousel card description"
        },
        "imageUrl": "https://assets-global.website-files.com/example-file.png",
        "buttons": [
          {
            "name": "Click for next step",
            "request": {
              "type": "", // path ID generated by Voiceflow
              "payload": {
                "label": "Click for next step",
                "actions": []
              }
            }
          }
        ]
      },
      {
        "id": "", // unique string generated by Voiceflow
        "title": "This is a second Carousel card title",
        "description": {
          "slate": [
            {
              "children": [
                {
                  "text": "This is a second Carousel card description. For this card, the image was uploaded as a png file."
                }
              ]
            }
          ],
          "text": "This is a second Carousel card description. For this card, the image was uploaded as a png file."
        },
        "imageUrl": "https://cm4-production-assets.s3.amazonaws.com/example-file.png",
        "buttons": [
          {
            "name": "Click for next step",
            "request": {
              "type": "", // path ID generated by Voiceflow
              "payload": {
                "label": "Click for next step",
                "actions": []
              }
            }
          }
        ]
      }
    ]
  }
}
type: choice (Button step)
This trace type is returned for the following Voiceflow elements: Button Step.

When you encounter a trace with a button, take note of the button objects' request.type values. The request.type value will determine how you retrieve the next elements via the Dialog Manager API upon button click (examples below).

The below example trace is for a Choice step with a button and intent:

JSON

{
  "time": 1753108390491,
  "type": "choice",
  "payload": {
    "buttons": [
      {
        "name": "Order coffee",
        "request": {
          "type": "path-cmd906pp400433b7ujbsbiotm",
          "payload": {
            "label": "Order coffee"
          }
        }
      }
    ]
  }
}
Notes on the above example:

The request.type values for these buttons would be Voiceflow-generated path IDs for the next elements.
In this case, upon button click: call the Dialog Manager API with the path ID as the action.type value to retrieve the next elements. For example, if the request.type value for the button is “path-xyz”, the request body would look like the below. (request.payload.label value is optional; if included in the request, the value will be set as the last_utterance variable value)
JSON

{
  "request": {
    "type": "path-xyz",
    "payload": {
      "label": "Check Account Balance"
    }
  }
}
The below example trace is for a Button step with two buttons with intents attached:

JSON

{
  "time": 1753109669620,
  "type": "choice",
  "payload": {
    "buttons": [
      {
        "name": "Check account for balance",
        "request": {
          "type": "intent",
          "payload": {
            "label": "Check account for balance",
            "query": "Check account for balance",
            "entities": [],
            "intent": {
              "name": "Check account for balance"
            }
          }
        }
      },
      {
        "name": "Forgot password",
        "request": {
          "type": "intent",
          "payload": {
            "label": "Forgot password",
            "query": "Forgot password",
            "entities": [],
            "intent": {
              "name": "Forgot password"
            }
          }
        }
      }
    ]
  }
}
Notes on the above example:

The request.type values for these buttons are “intent” and both have intent.name values in the payload.
In this case, upon button click: call the Dialog Manager API with the intent name to retrieve the next elements. For example, if the request.type value is “intent” and the request.payload.intent.name is “forgot_password”, the request body would look like the below. [Alternatively, you could use a "text" request (e.g. { "action": { "type": "text", "payload": "Forgot Password" } }); this option would first pass the payload value through intent detection.]
JSON

{
  "action": {
    "type": "intent",
    "payload": {
      "intent": {
        "name": "forgot_password"
      },
      "query": "",
      "entities": []
    }
  }
}
type: choice (Agent step)
In some cases—particularly when using the Agent Step—buttons returned in a choice trace may use a simpler structure where the request.type is text instead of a path ID or intent. If the Buttons toggle is enabled on the Agent step, the agent may dynamically generate buttons. These generated buttons simulate raw user input rather than triggering a specific path or intent directly.

Example Trace with request.type: text:

JSON

{
  "time": 1753110520157,
  "type": "choice",
  "payload": {
    "buttons": [
      {
        "name": "Check account balance",
        "request": {
          "type": "text",
          "payload": "Check account balance"
        }
      },
      {
        "name": "Forgot password",
        "request": {
          "type": "text",
          "payload": "Forgot password"
        }
      }
    ]
  }
}
Custom Actions
A Custom Action trace type value will match the string entered for the corresponding Custom Action in the Creator App.

The defaultPath attribute is useful if you want to set a default path during prototyping or user testing. The value will be 0 if the Custom Action's first path is assigned as the default in the Creator App, 1 if the second path is assigned, 2 if the third path is assigned, and so on.

Example with the Action Body format set to “Text” in the Creator App:

JSON

{
  "type": "calendar",
  "time": 1720552033,
  "payload": "{\n  \"today\": 1700096546693\n}",
  "defaultPath": 0,
  "paths": [
    {
      "event": {
        "type": "done"
      }
    },
    {
      "event": {
        "type": "cancel"
      }
    }
  ]
}
Example with the Action Body format set to “JSON” in the Creator App:

JSON

{
  "type": "calendar",
  "time": 1720552033,
  "payload": {
    "today": 1700096585398
  },
  "defaultPath": 0,
  "paths": [
    {
      "event": {
        "type": "done"
      }
    },
    {
      "event": {
        "type": "cancel"
      }
    }
  ]
}
type: end
This trace will be returned when an End action is reached in the design.

Example for a Chat Agent:

JSON

{
    "type": "end",
    "time": 1720552033,
    "payload": null
}
Example for a Voice Agent:

JSON

{
    "type": "end"
}
type: completion-events
You might encounter these traces while working with Interaction Streaming APIs:

"completion-start"
"completion-continue"
"completion-end"

## Interact

post
https://general-runtime.voiceflow.com/state/user/{userID}/interact
Sends a request to advance the conversation session with your Voiceflow project.

Requests
There are different types of requests that can be sent. To see a list of all request types, check out the documentation for the action field below.

To start a conversation, you should send a launch request. Then, to pass in your user's response, you should send a text request. If you have your own NLU matching, then you may want to directly send an intent request.

See the Request Examples on the right panel for more examples of valid request bodies.

Response Traces
After processing your request, the Dialog Manager API will then respond with an array of "traces" which are pieces of the overall response from the project:


[{
  "type": "speak",
  "payload": {
    "type": "message",
    "message": "would you like fries with that?"
  }
}, {
  "type": "visual",
  "payload": {
    "image": "https://voiceflow.com/pizza.png"
  }
}]
In the example above, the Voiceflow project responded by saying "would you like fries with that?" and an image of a pizza. You can then display the chatbot's response and the image in your app.

There are many types of response traces. Each trace is produced by a particular block on your Voiceflow project. Expand the documentation for the 200 OK response below to see a list of possible response traces.

Legacy responses
For legacy compatibility, you set the verbose query parameter to true to get a response similar to our legacy Stateless API.


// <- simplified verbose response body {
  "state": {
    "stack": [{
      "programID": "home flow",
      "nodeID": "yes no choice node"
    }],
    "storage": {},
    "variables": {
      "pizza_type": "pepperoni"
    }
  },
  "trace": [{
    "type": "speak",
    "payload": {
      "type": "message",
      "message": "would you like fries with that?"
    }
  }, {
    "type": "visual",
    "payload": {
      "image": "https://voiceflow.com/pizza.png"
    }
  }]
}
Path Params
userID
string
required
A unique user ID specified by the caller.

The Dialog Manager API creates an independent conversation session for each user ID, allowing your app to talk with different users simultaneously.

Query Params
verbose
boolean
Enables verbose responses similar to the legacy Stateless API.

This parameter exists for legacy compatibility reasons. New projects should always have this value set to false.


false
Body Params
action
object | null
The user's response, e.g, user requests starting a conversation or advances the conversation by providing some textual response.


Launch Request

Text Request

Intent Request

Event Request
config
object
Optional settings to configure the response


Config object
state
object

state object
Headers
versionID
string
The version of your Voiceflow project to contact.

Use 'development' to contact the version on canvas or 'production' to contact the published version.

Responses

200
A sequential array of response "traces" to display back to the user. They can take a variety of types - common types are defined here.

Response body

Verbose Response

Trace

400
Bad Request.

Could refer to a number of possible errors:

'Voiceflow project was not published to production' - Caller is contacting the production version, but the project did not publish a production version.

'Cannot resolve project version' - Caller's provided API key is potentially malformed and could not be used to resolve a version alias.

'Cannot resolve version alias' - Caller's provided API key is potentially malformed and could not be used to resolve a version alias.

'Request is missing a versionID' - Request is missing a versionID.


401
Auth Key Required

HTTP request is missing a Dialog Manager API key in the Authorization header


404
Model not found. Ensure project is properly rendered.

Attempted to interact with the 'development' version but the Prototype has not been rendered by hitting the Run button on the Voiceflow canvas.

Language

Shell

Node

Ruby

PHP

Python
Credentials
Header
VF.DM.690d97446b1eb840dac888bc.IMQGUPiGRjd6YHiX

1
curl --request POST \
2
     --url https://general-runtime.voiceflow.com/state/user/userID/interact \
3
     --header 'Authorization: VF.DM.690d97446b1eb840dac888bc.IMQGUPiGRjd6YHiX' \
4
     --header 'accept: application/json' \
5
     --header 'content-type: application/json' \
6
     --data '
7
{
8
  "action": {
9
    "type": "launch"
10
  },
11
  "config": {
12
    "tts": false,
13
    "stripSSML": true,
14
    "stopAll": false,
15
    "excludeTypes": [
16
      "block",
17
      "debug",
18
      "flow"
19
    ]
20
  }
21
}
22
'

Try It!
RESPONSE
1
[
2
  {
3
    "type": "speak",
4
    "payload": {
5
      "type": "message",
6
      "message": "one large pepperoni pizza is that correct?"
7
    }
8
  },
9
  {
10
    "type": "speak",
11
    "payload": {
12
      "type": "audio",
13
      "src": "https://voiceflow.com/chime.mp3",
14
      "message": "<audio src='https://voiceflow.com/chime.mp3'/>"
15
    }
16
  },
17
  {
18
    "type": "visual",
19
    "payload": {
20
      "image": "https://voiceflow.com/splash.mp3"
21
    }
22
  },
23
  {
24
    "type": "choice",
25
    "payload": {
26
      "choices": [
27
        {
28
          "name": "yes"
29
        },
30
        {
31
          "name": "no"
32
        }
33
      ]
34
    }
35
  }
36
]

