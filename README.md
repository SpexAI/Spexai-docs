# SpexAI Documentation

This repository contains the documentation website for SpexAI, built with React and Firebase.

## Quick Start

1. Clone the repository:
   git clone https://github.com/SpexAI/Spexai-docs.git
   cd Spexai-docs

2. Install dependencies:
   npm install

3. Create a .env file in the root directory with your Firebase configuration:
   REACT_APP_FIREBASE_API_KEY=your_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id

4. Start the development server:
   npm start

## Build

To create a production build:
npm run build

To serve the production build locally:
npx serve -s build

## Protected Routes

Some documentation routes require authentication. You can access these by:

1. Creating an account
2. Logging in
3. Accessing protected documentation

## Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Support

For support, email support@spexai.com or join our Discord community.
