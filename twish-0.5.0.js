// Sample formatted data with multiple titles and commands
const formattedData = `:: Title1
<<set $cheese to "a nice, sharp cheddar">>
<B>Text</B> description1 <<$cheese>>
<b>another test</b>
<<set $key to false>>
<<Set $name to "fred">>
<<if $key is false>>Hello dog
<<if $name is "fred">>[[Now you can go here]]
[[Title2|Title2]]
[[Title3]]

:: Title2
Text description2 <<set $gold to 5>>
[[Title1]]
[[Title3]]

:: Title3
<<set $gohere to "Title2">>
Text description3 <<set $chestEmpty to true>>
[[Title1]]
[[<<$gohere>>]]

:: Now you can go here
here
`;

// Variable to store the selected title
let currentTitle = 'Title1';

// Object to store variables
const variables = {};

// Function to process commands
function processCommands(text) {
    const regex = /<<(.+?)>>/g;
    return text.replace(regex, (match, command) => {
      const parts = command.split(' ');
      const action = parts[0];
  
      if (action === 'set') {
        const variableName = parts[1];
        const value = eval(parts.slice(3).join(' '));
        variables[variableName] = value;
        return '';
      } else if (action === 'if') {
        const variableName = parts[1];
        const condition = parts[3];
        const value = eval(parts.slice(4).join(' '));
        if ((variables[variableName] && condition === 'is' && variables[variableName] === value) ||
            (!variables[variableName] && condition === 'is' && value === 'false')) {
          return parts.slice(5).join(' ');
        } else {
          return '';
        }
      } else if (action.startsWith('$')) {
        const variableName = action;
        return variables[variableName] || '';
      }
  
      return '';
    });
  }
  
// Function to parse the formatted data
function parseData(data) {
  const sections = data.split('\n\n');
  const parsedData = {};

  sections.forEach(section => {
    const lines = section.split('\n');
    const title = lines[0].substring(3).trim();

    // Process commands in the section
    const processedSection = processCommands(section);
    const processedLines = processedSection.split('\n');

    let description = '';
    const linkTargets = [];

    for (let i = 1; i < processedLines.length && linkTargets.length < 10; i++) {
      let line = processedLines[i].trim();

      if (line.startsWith('[[') && line.endsWith(']]')) {
        // Extracting link text and link destination separately
        let linkText, linkDestination;

        if (line.includes('|')) {
          linkText = line.substring(2, line.indexOf('|'));
          linkDestination = line.substring(line.indexOf('|') + 1, line.length - 2);
        } else {
          linkText = linkDestination = line.substring(2, line.length - 2);
        }

        linkText = processCommands(linkText.trim());
        linkDestination = processCommands(linkDestination.trim());

        linkTargets.push({ text: linkText, destination: linkDestination });
      } else {
        description += line + '\n';
      }
    }

    description = description.trim();

    parsedData[title] = {
      description,
      linkTargets
    };
  });

  return parsedData;
}
  

// Parse the formatted data
const parsedData = parseData(formattedData);

// Function to display the description and link targets based on the selected title
function displayData(title) {
    const selectedData = parsedData[title];
    if (selectedData) {
      document.getElementById('title').textContent = title;
      document.getElementById('description').innerHTML = selectedData.description;
  
      const linkTargetsContainer = document.getElementById('linkTargets');
      linkTargetsContainer.innerHTML = '';
  
      selectedData.linkTargets.forEach(linkTarget => {
        const link = document.createElement('a');
        link.href = '#';
  
        // Check if linkTarget is an object
        if (typeof linkTarget === 'object') {
          link.textContent = linkTarget.text;
          link.addEventListener('click', () => {
            currentTitle = linkTarget.destination;
            displayData(currentTitle);
          });
        } else { // If linkTarget is a string
          link.textContent = linkTarget;
          link.addEventListener('click', () => {
            currentTitle = linkTarget;
            displayData(currentTitle);
          });
        }
  
        linkTargetsContainer.appendChild(link);
        linkTargetsContainer.appendChild(document.createElement('br'));
      });
    } else {
      document.getElementById('title').textContent = '';
      document.getElementById('description').textContent = 'No description found for the selected title.';
      document.getElementById('linkTargets').innerHTML = '';
    }
  
    // Display variables
    displayVariables();
  }
  

// Function to display variables
function displayVariables() {
  const variablesContainer = document.getElementById('variables');
  variablesContainer.innerHTML = '';

  for (const variableName in variables) {
    const variableValue = variables[variableName];
    const variableElement = document.createElement('p');
    variableElement.textContent = `${variableName}: ${variableValue}`;
    variablesContainer.appendChild(variableElement);
  }
}

// Display the data based on the current title
displayData(currentTitle);
