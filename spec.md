# **Species Counterpoint Web App - Specification**

## **1. Overview**

This web app will allow users to input a cantus firmus (CF) and generate a counterpoint in a selected species (1st to 5th species of counterpoint). The app will provide the user with an interactive interface to visualize the cantus firmus and counterpoint, play back the melody, manually adjust the notes, and export the counterpoint as a MusicXML file.

---

## **2. Functional Requirements**

### **2.1 Cantus Firmus Input**
- **Method of Input**: Users will input the cantus firmus using a visual staff interface.
- **Rhythm**: The cantus firmus will consist of one note per measure, and the rhythm will be fixed to whole notes.
- **Clef**: Users can choose between treble or bass clef for the cantus firmus.
- **Pitch Range**: The cantus firmus must remain within a single octave to follow traditional counterpoint conventions (e.g., C4 to C5).
- **Mode**: Users can input any set of notes; the mode will be implied based on the melody.

### **2.2 Counterpoint Generation**
- **Species Selection**: The user can select the species of counterpoint (1st to 5th species).
    - Default: 1st species.
    - Tooltips will provide explanations of each species (e.g., “One note in the counterpoint per note in the cantus firmus” for 1st species).
- **Counterpoint Placement**: The counterpoint can be generated above or below the cantus firmus as chosen by the user.
- **Rules Enforcement**: The app will enforce strict counterpoint rules when possible (e.g., no parallel fifths or octaves, correct cadences).
    - If a valid solution cannot be found due to the cantus firmus or species constraints, the app will generate an approximate counterpoint and notify the user.
    - Users can manually adjust the counterpoint afterward.
- **Playback**: Once the counterpoint is generated, users can play back both the cantus firmus and the counterpoint using a shared piano sound.
- **Manual Adjustments**: Users can drag notes in the visual staff interface to adjust the counterpoint.

### **2.3 Visualization**
- **Staff**: The app will render the cantus firmus and counterpoint on a visual music staff.
- **Note Manipulation**: Notes in the counterpoint can be manually adjusted via drag-and-drop interactions.
- **History**: The app will maintain a temporary history of generated counterpoints that users can revisit within the same session.
- **Error Feedback**: Users will receive visual feedback for rule violations (e.g., red highlights for parallel fifths) when they choose to check the rules.

### **2.4 Exporting and Sharing**
- **MusicXML Export**: The app will export the generated counterpoint as a MusicXML file.
- **URL Sharing**: The app will allow users to share their generated cantus firmus and counterpoint via a URL, which will pre-populate the staff with the specific notes for others to view.

### **2.5 Session Management**
- **Temporary History**: Users can generate an unlimited number of counterpoints during a session (within reason), with each result being stored temporarily.
- **Cantus Firmus Length**: The cantus firmus can have up to 16 measures, and the counterpoint will be limited to a similar length (8-16 measures).

---

## **3. Non-Functional Requirements**

### **3.1 Performance**
- **Real-Time Updates**: The app should generate counterpoints in real-time, ensuring responsiveness even with adjustments.
- **Audio Playback**: Playback of both the cantus firmus and counterpoint should be seamless, with minimal delay.

### **3.2 Usability**
- **Minimalistic Interface**: The app should have a simple, clean design, with a focus on usability for non-expert users.
- **Tooltips**: Explanatory tooltips will provide guidance when selecting the species of counterpoint.
- **Mobile Support**: The app should be usable on mobile devices, with touch support for note manipulation.

---

## **4. Tech Stack**

### **Frontend**
- **React**: To build the user interface, including the interactive staff and drag-and-drop note manipulation.
- **VexFlow**: For rendering musical notation and interacting with the staff.
- **Tone.js**: For audio playback of the cantus firmus and counterpoint.
- **React DnD**: For enabling the drag-and-drop functionality for adjusting notes on the staff.
- **CSS**: For styling the app (consider using Styled Components if desired).

### **Backend (Optional)**
- **Node.js + Express**: If the app needs backend processing (e.g., for MusicXML generation), this is a lightweight and scalable option.
- **MusicXML Libraries**: Use libraries like `musicxml-interfaces` to handle the generation of MusicXML files for export.

### **Testing**
- **Jest + React Testing Library**: For unit and integration testing of React components and user interactions.
- **Cypress**: For end-to-end testing to simulate full user flows (e.g., generating counterpoints, adjusting notes, and exporting files).

### **Deployment**
- **Vercel or Netlify**: For front-end deployment, with continuous integration for easy updates.
- **Heroku or DigitalOcean**: For hosting a backend, if needed.

---

## **5. Data Handling and Architecture**

### **5.1 State Management**
- **React State**: Use React's local state or Context API for managing the cantus firmus, counterpoint, and temporary history.
- **Backend (if implemented)**: Store any user-generated content (e.g., counterpoints, history) in an in-memory database or temporarily in the session.

### **5.2 Exporting MusicXML**
- **MusicXML Format**: Export the generated counterpoint as a MusicXML file, which can be imported into other music notation software.

### **5.3 Error Handling**
- **Invalid Inputs**: If the user inputs notes outside the specified octave, show a visual warning (e.g., highlighting the notes in yellow).
- **Rule Violations**: If the counterpoint violates strict species counterpoint rules, show a warning on the staff and allow manual adjustments.
- **Audio Playback Errors**: Gracefully handle any errors related to audio playback by providing a fallback or alerting the user.

---

## **6. Testing Plan**

### **6.1 Unit Testing**
- Test individual React components (e.g., the cantus firmus input, counterpoint rendering, and note manipulation).
- Test backend functionality (if implemented), such as MusicXML file generation.

### **6.2 Integration Testing**
- Test user flows, such as generating a counterpoint, adjusting it, and exporting it as a MusicXML file.
- Ensure that species selection, counterpoint generation, and rule-checking are all functioning as expected.

### **6.3 End-to-End Testing**
- Simulate the entire user experience from inputting the cantus firmus to exporting the counterpoint.
- Verify that playback, note manipulation, and history work as expected.
