import React from 'react';

// Constants for magic strings
const DATE_OPTIONS = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

// Function to format date
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", DATE_OPTIONS);
}

export default function PrivacyPolicy({
  app_name,
  company_name,
  company_address,
  contact_email,
}: {
  app_name: string;
  company_name: string;
  company_address: string;
  contact_email: string;
}) {
  const date = new Date();
  const formattedDate = formatDate(date);

  return (
    <html>
      <head>
        <title>Privacy Policy</title>
      </head>
      <body>
        <h1>Privacy Policy</h1>
        <p>Last updated: {formattedDate}</p>
        {/* Rest of the JSX content */}
        <h1>Contact Us</h1>
        <p>If you have any questions about this Privacy Policy, You can contact us:</p>
        <ul>
          <li>By email: {contact_email}</li>
        </ul>
      </body>
    </html>
  );
}
