export default function TermsOfService({
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
  
  export default function TermsOfService({
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
          <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
          <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
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
}
