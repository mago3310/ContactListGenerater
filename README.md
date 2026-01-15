# Contact List Generator

This project is a React application built with Vite.

## Project Setup

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd ContactListGenerater
    ```
3.  Install dependencies:
    ```bash
    # If you are on Windows and encounter execution policy errors, use cmd /c npm install
    npm install
    ```

## Development

To start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

1.  Push changes to the `main` branch.
2.  The "Deploy to GitHub Pages" action will trigger automatically.
3.  Once completed, the site will be available at your GitHub Pages URL.

**Note:** Ensure that in your GitHub repository settings under **Pages**, the source is set to "GitHub Actions".
