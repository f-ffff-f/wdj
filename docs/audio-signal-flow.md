````mermaid
graph LR
    %% Deck A
    AudioElementA["Audio Element A"] --> MediaElementSourceA["MediaElementSource A"]
    MediaElementSourceA --> GainNodeA["GainNode A"]
    GainNodeA --> CrossFadeNode["CrossFadeNode"]

    %% Deck B
    AudioElementB["Audio Element B"] --> MediaElementSourceB["MediaElementSource B"]
    MediaElementSourceB --> GainNodeB["GainNode B"]
    GainNodeB --> CrossFadeNode

    %% Final connection to destination
    CrossFadeNode --> Destination["Destination"]
    ```
````
