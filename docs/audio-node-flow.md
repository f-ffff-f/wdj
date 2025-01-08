````mermaid
graph LR
    %% Deck A
    AudioBufferA["AudioBuffer A"] --> AudioBufferSourceNodeA["AudioBufferSourceNode A"] --> GainNodeA["GainNode A"]
    GainNodeA --> CrossFadeNodeA --> Destination["Destination"]

    %% Deck B
    AudioBufferB["AudioBuffer B"] --> AudioBufferSourceNodeB["AudioBufferSourceNode B"] --> GainNodeB["GainNode B"]
    GainNodeB --> CrossFadeNodeB --> Destination["Destination"]

    %% Final connection to destination
    ```
````
