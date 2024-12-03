```mermaid
graph LR
    %% Deck A
    AudioElementA["Audio Element A"] --> MediaElementSourceA["MediaElementSource A"]
    MediaElementSourceA --> GainNodeA["GainNode A"]
    GainNodeA --> CrossfadeNode["CrossfadeNode"]

    %% Deck B
    AudioElementB["Audio Element B"] --> MediaElementSourceB["MediaElementSource B"]
    MediaElementSourceB --> GainNodeB["GainNode B"]
    GainNodeB --> CrossfadeNode

    %% Final connection to destination
    CrossfadeNode --> Destination["Destination"]
    ```