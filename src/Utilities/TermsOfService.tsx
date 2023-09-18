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
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return `
    <html>
    <head><title>Privacy Policy</title></head>
    <body>
    <h1>Privacy Policy</h1>
    <p>Last updated: ${formattedDate}</p>
    <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
    <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>
    <h1>Interpretation and Definitions</h1>
    <h2>Interpretation</h2>
    <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
    <h2>Definitions</h2>
    <p>For the purposes of this Privacy Policy:</p>
    <ul>
    <li>
    <p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p>
    </li>
    <li>
    <p><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</p>
    </li>
    <li>
    <p><strong>Application</strong> refers to ${app_name}, the software program provided by the Company.</p>
    </li>
    <li>
    <p><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to ${company_name}, ${company_address}.</p>
    </li>
    <li>
    <p><strong>Country</strong> refers to: California,  United States</p>
    </li>
    <li>
    <p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p>
    </li>
    <li>
    <p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p>
    </li>
    <li>
    <p><strong>Service</strong> refers to the Application.</p>
    </li>
    <li>
    <p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>
    </li>
    <li>
    <p><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</p>
    </li>
    <li>
    <p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>
    </li>
    <li>
    <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
    </li>
    </ul>
    <h1>Collecting and Using Your Personal Data</h1>
    <h2>Types of Data Collected</h2>
    <h3>Personal Data</h3>
    <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
    <ul>
    <li>
    <p>Email address</p>
    </li>
    <li>
    <p>First name and last name</p>
    </li>
    <li>
    <p>Phone number</p>
    </li>
    <li>
    <p>Address, State, Province, ZIP/Postal code, City</p>
    </li>
    <li>
    <p>Usage Data</p>
    </li>
    </ul>
    <h3>Usage Data</h3>
    <p>Usage Data is collected automatically when using the Service.</p>
    <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
    <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
    <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.</p>
    <h3>Information from Third-Party Social Media Services</h3>
    <p>The Company allows You to create an account and log in to use the Service through the following Third-party Social Media Services:</p>
    <ul>
    <li>Google</li>
    <li>Facebook</li>
    <li>Instagram</li>
    <li>Twitter</li>
    <li>LinkedIn</li>
    </ul>
    <p>If You decide to register through or otherwise grant us access to a Third-Party Social Media Service, We may collect Personal data that is already associated with Your Third-Party Social Media Service's account, such as Your name, Your email address, Your activities or Your contact list associated with that account.</p>
    <p>You may also have the option of sharing additional information with the Company through Your Third-Party Social Media Service's account. If You choose to provide such information and Personal Data, during registration or otherwise, You are giving the Company permission to use, share, and store it in a manner consistent with this Privacy Policy.</p>
    <h3>Information Collected while Using the Application</h3>
    <p>While using Our Application, in order to provide features of Our Application, We may collect, with Your prior permission:</p>
    <ul>
    <li>Information regarding your location</li>
    <li>Information from your Device's phone book (contacts list)</li>
    <li>Pictures and other information from your Device's camera and photo library</li>
    </ul>
    <p>We use this information to provide features of Our Service, to improve and customize Our Service. The information may be uploaded to the Company's servers and/or a Service Provider's server or it may be simply stored on Your device.</p>
    <p>You can enable or disable access to this information at any time, through Your Device settings.</p>
    <h2>Use of Your Personal Data</h2>
    <p>The Company may use Personal Data for the following purposes:</p>
    <ul>
    <li>
    <p><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</p>
    </li>
    <li>
    <p><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p>
    </li>
    <li>
    <p><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p>
    </li>
    <li>
    <p><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p>
    </li>
    <li>
    <p><strong>To provide You</strong> with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</p>
    </li>
    <li>
    <p><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</p>
    </li>
    <li>
    <p><strong>For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</p>
    </li>
    <li>
    <p><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</p>
    </li>
    <li>
    <p>
    We engage third parties to provide analytics services and serve advertisements on our behalf. These entities may use cookies, web beacons, device identifiers, and other technologies to collect information about your use of our Services and other websites and applications, including your IP address, web browser, mobile network information, pages viewed, time spent on pages or in mobile apps, links clicked, and conversion information. This information may be used by Mindie and others to, among other things, analyze and track data, determine the popularity of certain content, deliver advertising and content targeted to your interests on our Services and other websites, and better understand your online activity. For more information about interest-based ads, or to opt out of having your web browsing information used for behavioral advertising purposes, please visit www.aboutads.info/choices Your device may also include a feature ("Limit Ad Tracking" on iOS or "Opt Out of Interest-Based Ads" or "Opt Out of Ads Personalization" on Android) that allows you to opt out of having certain information collected through mobile apps used for behavioral advertising purposes.
    </p>
    </li>
    <li>
    <p>
    We also work with third parties to serve ads to you as part of customized campaigns on third-party platforms (such as Facebook and Instagram). As part of these ad campaigns, we or the third-party platforms may convert information about you, such as your email address and phone number, into a unique value that can be matched with a user account on these platforms to allow us to learn about your interests and serve you advertising that is customized to your interests. Note that the third-party platforms may offer you choices about whether you see these types of customized ads.
    </p>
    </li>
    </ul>
    <p>We may share Your personal information in the following situations:</p>
    <ul>
    <li><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service,  to contact You.</li>
    <li><strong>For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
    <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
    <li><strong>With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
    <li><strong>With other users:</strong> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside. If You interact with other users or register through a Third-Party Social Media Service, Your contacts on the Third-Party Social Media Service may see Your name, profile, pictures and description of Your activity. Similarly, other users will be able to view descriptions of Your activity, communicate with You and view Your profile.</li>
    <li><strong>With Your consent</strong>: We may disclose Your personal information for any other purpose with Your consent.</li>
    </ul>
    <h2>Retention of Your Personal Data</h2>
    <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
    <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.</p>
    <h2>Transfer of Your Personal Data</h2>
    <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.</p>
    <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
    <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>
    <h2>Delete Your Personal Data</h2>
    <p>You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.</p>
    <p>Our Service may give You the ability to delete certain information about You from within the Service.</p>
    <p>You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.</p>
    <p>Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.</p>
    <h2>Disclosure of Your Personal Data</h2>
    <h3>Business Transactions</h3>
    <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
    <h3>Law enforcement</h3>
    <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
    <h3>Other legal requirements</h3>
    <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
    <ul>
    <li>Comply with a legal obligation</li>
    <li>Protect and defend the rights or property of the Company</li>
    <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
    <li>Protect the personal safety of Users of the Service or the public</li>
    <li>Protect against legal liability</li>
    </ul>
    <h2>Security of Your Personal Data</h2>
    <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
    <h1>Children's Privacy</h1>
    <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.</p>
    <h1>YOUR CALIFORNIA PRIVACY RIGHTS</h1>
    <p>The California Consumer Privacy Act or "CCPA" (Cal. Civ. Code § 1798.100 et seq.) affords consumers residing in California certain rights with respect to their personal information. If you are a California resident, this section applies to you.</p>
    <p>Collection and Use of Personal Information: In the preceding 12 months, we have collected the following categories of personal information: identifiers; characteristics of protected classifications under California or federal law; commercial information; Internet or other electronic network activity information; geolocation data; audio, electronic, visual or similar information; and inferences made by us. For details about the precise data points we collect and the categories of sources of such collection, please see the Collection of Information section above. We collect personal information for the business and commercial purposes described in the Use of Information section above.</p>
    <p>Disclosure of Personal Information: We may share your personal information with third parties as described in the Sharing of Information section above. In the preceding 12 months, we have disclosed the following categories of personal information for business purposes to the following categories of recipients:</p><p>
    We share identifiers with advertising networks, customer support partners, data analytics providers, fraud prevention partners, marketing partners, and payment processors.</p><p>
    We share commercial information with advertising networks, customer support partners, fraud prevention partners, marketing partners, and payment processors.</p><p>
    We share Internet or other electronic network activity information with advertising networks, customer support partners, data analytics providers, marketing partners, and payment processors.</p><p>
    We share geolocation data with advertising networks, marketing partners, and payment processors.</p><p>
    We share audio, electronic, visual or similar information with customer support partners.</p><p>
    We share inferences made by us with advertising networks and data analytics providers.</p><p>
    Sale of Personal Information: Mindie does not sell your personal information. We do allow our advertising partners to collect certain device identifiers and electronic network activity via our Services to show ads that are targeted to your interests. To opt out of having your personal information used for targeted advertising purposes, please see the Advertising and Analytics section above.</p><p>
    Your Rights: If you are a California resident, you have the right, subject to certain limitations, to: (1) request to know more about the categories and specific pieces of personal information we collect, use, and disclose; (2) request deletion of your personal information; (3) opt out of any "sales" of your personal information that may be occurring; and (4) not be discriminated against for exercising these rights. You may make these requests by calling [insert toll-free phone number] or visiting our Personal Data Requests page [link to rights request webform]. We will verify your request by asking you to provide information related to your recent interactions with us, such as information about a recent purchase. We will not discriminate against you if you exercise your rights under the CCPA.</p><p>
    If we receive your request from an authorized agent, we may ask for evidence that you have provided such agent with a power of attorney or that the agent otherwise has valid written authority to submit requests to exercise rights on your behalf. If you are an authorized agent seeking to make a request, please contact us.</p>
    <h1>ADDITIONAL DISCLOSURES FOR INDIVIDUALS IN EUROPE</h1>
    <p>If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, you have certain rights and protections under the law regarding the processing of your personal data, and this section applies to you.</p>
    <h3>Legal Basis for Processing</h3>
    <p>When we process your personal data, we will do so in reliance on the following lawful bases:</p>
    <p>To perform our responsibilities under our contract with you (e.g., processing payments for and providing the products and services you requested).</p>
    <p>When we have a legitimate interest in processing your personal data to operate our business or protect our interests (e.g., to provide, maintain, and improve our products and services, conduct data analytics, and communicate with you).</p>
    <p>To comply with our legal obligations (e.g., to maintain a record of your consents and track those who have opted out of marketing communications).</p>
    <p>When we have your consent to do so (e.g., when you opt in to receive marketing communications from us). When consent is the legal basis for our processing your personal data, you may withdraw such consent at any time.</p>
    <h3>Data Retention</h3>
    <p>We store personal data for as long as necessary to carry out the purposes for which we originally collected it and for other legitimate business purposes, including to meet our legal, regulatory, or other compliance obligations.</p>
    <h3>Data Subject Requests</h3>
    <p>Subject to certain limitations, you have the right to request access to the personal data we hold about you and to receive your data in a portable format, the right to ask that your personal data be corrected or erased, and the right to object to, or request that we restrict, certain processing. If you would like to exercise any of these rights, please contact us.</p>
    <h3>Questions or Complaints</h3>
    <p>If you have a concern about our processing of personal data that we are not able to resolve, you have the right to lodge a complaint with the Data Protection Authority where you reside. Contact details for your Data Protection Authority can be found using the links below:</p>
    <p>For individuals in the EEA: https://edpb.europa.eu/about-edpb/board/members_en</p>
    <p>For individuals in the UK: https://ico.org.uk/global/contact-us/</p>
    <p>For individuals in Switzerland: https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html</p>
    <p>If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.</p>
    <h1>Links to Other Websites</h1>
    <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
    <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
    <h1>Changes to this Privacy Policy</h1>
    <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
    <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>
    <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
    <h1>Contact Us</h1>
    <p>If you have any questions about this Privacy Policy, You can contact us:</p>
    <ul>
    <li>By email: ${contact_email}</li>
    </ul>
    </body>
    </html>  
`;
}
