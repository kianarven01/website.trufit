export interface Position {
  id: number;
  title: string;
  category: "Office" | "Technical";
  type: string;
  location: string;
  responsibilities: string[];
  requirements: string[];
}

export const positions: Position[] = [
  {
    id: 1,
    title: "Administrative Officer",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Manage and coordinate daily office operations and administrative tasks.",
      "Maintain physical and digital records, filing systems, and company documentation.",
      "Coordinate schedules, meetings, and travel arrangements for management.",
      "Oversee office supply inventory and handle purchasing requests.",
      "Assist in preparing reports, presentations, and correspondence."
    ],
    requirements: [
      "Bachelor's degree in Business Administration or a related field.",
      "Proven experience as an Administrative Officer or in a similar role.",
      "Excellent organizational and time-management skills.",
      "Strong proficiency in MS Office and Google Workspace.",
      "Outstanding written and verbal communication abilities."
    ]
  },
  {
    id: 2,
    title: "HR Team Head",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Oversee the entire recruitment, onboarding, and talent acquisition process.",
      "Develop and implement HR strategies and initiatives aligned with overall business strategy.",
      "Bridge management and employee relations by addressing demands, grievances, or other issues.",
      "Manage payroll, benefits administration, and employee compliance protocols.",
      "Nurture a positive working environment and promote company culture."
    ],
    requirements: [
      "Degree in Human Resources Management, Psychology, or Business.",
      "3+ years of experience as an HR Specialist, Generalist, or Team Leader.",
      "In-depth knowledge of labor law and HR best practices.",
      "Excellent active listening, negotiation, and presentation skills.",
      "Competence to build and effectively manage interpersonal relationships at all levels."
    ]
  },
  {
    id: 3,
    title: "Purchasing Team Head",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Lead and manage the purchasing team to source automotive parts and supplies.",
      "Develop and implement purchasing strategies, policies, and procedures.",
      "Negotiate contracts, pricing, and terms with suppliers and vendors.",
      "Monitor and forecast inventory levels to ensure supply continuity.",
      "Evaluate vendor performance and resolve supply chain issues."
    ],
    requirements: [
      "Degree in Supply Chain Management, Business, or Logistics.",
      "Proven experience as a Purchasing Agent, Buyer, or Team Lead.",
      "Strong negotiation, communication, and networking skills.",
      "Familiarity with automotive parts and inventory systems is an advantage.",
      "Analytical mindset with excellent cost management skills."
    ]
  },
  {
    id: 4,
    title: "Accounting Team Head",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Supervise daily operations of the accounting department.",
      "Manage month-end and year-end closing processes, financial reporting, and audits.",
      "Ensure compliance with local tax laws, accounting standards, and company policies.",
      "Monitor cash flow, budgeting, and financial forecasting.",
      "Provide financial analysis to management for strategic decision-making."
    ],
    requirements: [
      "Bachelor's degree in Accounting, Finance, or CPA license.",
      "3+ years of accounting experience, preferably in a supervisory role.",
      "Advanced knowledge of accounting software (e.g., QuickBooks, SAP) and Excel.",
      "High attention to detail and strong analytical skills.",
      "Strong leadership and team management abilities."
    ]
  },
  {
    id: 5,
    title: "Technical Team Head",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Manage workshop technicians and oversee all vehicle repair operations.",
      "Ensure highest level of technical quality, diagnostic accuracy, and safety.",
      "Provide guidance, training, and troubleshooting support to junior technicians.",
      "Manage workflow distribution and monitor technician productivity.",
      "Review and verify complex diagnostic reports and work order sheets."
    ],
    requirements: [
      "Degree or vocational diploma in Automotive Technology or related field.",
      "5+ years of hands-on automotive repair experience.",
      "Proven leadership skills with previous team management experience.",
      "Expert knowledge of modern automotive diagnostics, scanning tools, and software.",
      "Excellent problem-solving and communication skills."
    ]
  },
  {
    id: 6,
    title: "Sales and Marketing Team Head",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Develop and execute strategic marketing plans to drive customer acquisition.",
      "Lead the sales team in achieving monthly and quarterly service targets.",
      "Oversee digital marketing campaigns, social media branding, and local promotions.",
      "Build and maintain strong relationships with corporate clients and partners.",
      "Analyze market trends and customer feedback to optimize marketing efforts."
    ],
    requirements: [
      "Bachelor's degree in Marketing, Business Administration, or related.",
      "Proven track record in sales, marketing, or business development.",
      "Excellent leadership, interpersonal, and communication skills.",
      "Experience in the automotive services industry is highly desirable.",
      "Creative thinker with a data-driven approach to marketing campaigns."
    ]
  },
  {
    id: 7,
    title: "Warehouse Staff",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Receive, inspect, catalog, and store incoming automotive parts and supplies.",
      "Prepare and dispatch orders for the workshop team promptly.",
      "Perform regular inventory counts and report stock discrepancies.",
      "Maintain a clean, organized, and safe warehouse environment.",
      "Operate warehouse equipment safely following safety guidelines."
    ],
    requirements: [
      "High school diploma or vocational equivalent.",
      "Proven experience as a Warehouse Clerk, Stock Staff, or similar.",
      "Familiarity with inventory tracking systems and database logging.",
      "Physical stamina to lift heavy automotive components.",
      "Good team player with strong attention to detail."
    ]
  },
  {
    id: 8,
    title: "Accounting Staff",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Process and record accounts payable and receivable transactions.",
      "Prepare billing invoices, billing statements, and receipts.",
      "Perform monthly bank reconciliations and general ledger maintenance.",
      "Assist in preparing tax filings and financial reports.",
      "Organize and maintain secure accounting files and records."
    ],
    requirements: [
      "Bachelor's degree in Accounting, Finance, or equivalent.",
      "Solid understanding of basic bookkeeping and accounting principles.",
      "Proficiency in Excel and standard accounting software.",
      "High accuracy and strong attention to detail.",
      "Ability to handle confidential financial information professionally."
    ]
  },
  {
    id: 9,
    title: "Service Manager",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Oversee daily operations of the service department and workshop throughput.",
      "Maintain high customer satisfaction scores and resolve customer disputes.",
      "Manage staff scheduling, performance reviews, and training programs.",
      "Monitor service department revenue, expenses, and profitability goals.",
      "Ensure compliance with all safety regulations, DTI, and company protocols."
    ],
    requirements: [
      "Degree in Business Management or Automotive Technology.",
      "3+ years of experience in service center management.",
      "Exceptional leadership, communication, and customer service skills.",
      "Strong understanding of automotive service center financials.",
      "Problem-solving mindset under fast-paced shop conditions."
    ]
  },
  {
    id: 10,
    title: "Service Advisor",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Greet customers, listen to their vehicle concerns, and document issues clearly.",
      "Recommend suitable maintenance services and explain diagnostic findings.",
      "Provide accurate cost estimates and timelines to customers.",
      "Act as the liaison between the customer and the technical workshop team.",
      "Verify completed work and explain the service invoice upon delivery."
    ],
    requirements: [
      "High school diploma or equivalent; automotive background is a plus.",
      "Proven customer service or sales experience, ideally in automotive.",
      "Excellent interpersonal and verbal communication skills.",
      "Basic technical understanding of automotive parts and systems.",
      "Ability to multi-task and manage customer expectations effectively."
    ]
  },
  {
    id: 11,
    title: "Customer Relations Officer",
    category: "Office",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Manage and resolve customer inquiries, feedback, and complaints.",
      "Conduct post-service follow-up calls to measure satisfaction levels.",
      "Maintain up-to-date records of customer feedback and action taken.",
      "Coordinate with the service manager to address service delivery issues.",
      "Develop programs and initiatives to enhance customer loyalty."
    ],
    requirements: [
      "Degree in Communications, Hospitality, Marketing, or related.",
      "Experience in customer relations, call center, or guest services.",
      "Empathetic, patient, and highly skilled in conflict resolution.",
      "Excellent communication and active listening skills.",
      "Proficient in database entry and CRM software."
    ]
  },
  {
    id: 12,
    title: "Leadman",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Supervise and coordinate workshop repair jobs on a shift-by-shift basis.",
      "Delegate specific tasks to technicians according to capability and workload.",
      "Perform quality checks on finished repairs before vehicle release.",
      "Assist in complex diagnostics and guide technicians on repair procedures.",
      "Ensure clean, organized, and highly efficient work bays."
    ],
    requirements: [
      "Vocational certificate in Automotive Technology or high experience.",
      "4+ years of hands-on mechanical repair experience.",
      "Strong supervisory and leadership qualities.",
      "Expert skills in automotive troubleshooting and repairs.",
      "Highly organized and safety-conscious."
    ]
  },
  {
    id: 13,
    title: "Assistant Leadman",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Assist the Leadman in workshop supervision and job delegation.",
      "Perform complex automotive diagnostics, mechanical and electrical repairs.",
      "Guide apprentice mechanics and helpers in proper tool handling and safety.",
      "Step in for the Leadman during absences to maintain workshop flow.",
      "Monitor bay cleanliness and equipment maintenance schedules."
    ],
    requirements: [
      "Automotive mechanic certification or vocational degree.",
      "3+ years of professional shop experience.",
      "Good communication skills and potential to lead a team.",
      "Strong technical troubleshooting and repair capabilities.",
      "Proactive, reliable, and highly detail-oriented."
    ]
  },
  {
    id: 14,
    title: "Electrical Technician",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Diagnose, repair, and maintain vehicle electrical and electronic systems.",
      "Troubleshoot wiring circuits, alternators, starter motors, and battery systems.",
      "Use advanced scanning tools to identify and clear computer diagnostic codes.",
      "Install and test aftermarket electronic accessories and safety devices.",
      "Ensure all electrical repairs meet OEM standard specifications."
    ],
    requirements: [
      "Specialized training or certification in Automotive Electrical Systems.",
      "2+ years of experience focusing on vehicle electronics and wiring.",
      "Expert knowledge of multimeters, oscilloscopes, and scanning tools.",
      "Detail-oriented with a systematic troubleshooting approach.",
      "Familiarity with hybrid/electric vehicle systems is an advantage."
    ]
  },
  {
    id: 15,
    title: "Transmission Technician",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Diagnose, disassemble, repair, and rebuild manual and automatic transmissions.",
      "Inspect and replace worn gears, clutches, bands, valves, and seals.",
      "Troubleshoot electronic transmission controls, sensors, and solenoids.",
      "Flush transmission fluids, inspect transfer cases, and differential systems.",
      "Perform test drives to verify gearshift smoothness and quality."
    ],
    requirements: [
      "Certification in Automotive Transmission Repair or similar.",
      "3+ years of experience specializing in transmission rebuilds.",
      "Excellent diagnostic and mechanical skills for intricate gear assemblies.",
      "Familiarity with modern electronic transmission diagnostics.",
      "High attention to detail and precision workmanship."
    ]
  },
  {
    id: 16,
    title: "Underchassis Technician",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Diagnose and repair vehicle suspension, steering, and braking systems.",
      "Replace shocks, struts, control arms, ball joints, and tie rod ends.",
      "Perform 3D wheel alignments, tire balancing, and brake pad/rotor resurfacing.",
      "Inspect driveshafts, CV joints, boots, and undercarriage components.",
      "Ensure precise adjustments to alignment specifications."
    ],
    requirements: [
      "Vocational training in Automotive Technology or practical experience.",
      "2+ years of experience in underchassis and brake repair.",
      "Expert knowledge of alignment machinery and wheel service equipment.",
      "Detail-oriented and capable of physically demanding tasks.",
      "Strong commitment to safety guidelines."
    ]
  },
  {
    id: 17,
    title: "Aircon Technician",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Diagnose, service, and repair automotive heating, ventilation, and A/C systems.",
      "Perform leak detection, refrigerant recovery, and recharging procedures.",
      "Replace faulty compressors, condensers, evaporators, expansion valves, and blowers.",
      "Inspect cabin air filters and sanitize interior climate control vents.",
      "Ensure climate systems operate at optimal cooling capacity."
    ],
    requirements: [
      "Certification in Mobile Air Conditioning (MAC) or A/C repair.",
      "2+ years of professional automotive A/C repair experience.",
      "Expert skills in refrigerant handling and recovery equipment.",
      "Strong troubleshooting ability for pneumatic and electric HVAC controls.",
      "Knowledge of environmental laws regarding refrigerant disposal."
    ]
  },
  {
    id: 18,
    title: "General Mechanic",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Perform general automotive maintenance: oil changes, fluid flushes, belt replacements.",
      "Diagnose and repair basic engine, cooling, fuel, and exhaust problems.",
      "Conduct vehicle multi-point inspections and document repair recommendations.",
      "Replace spark plugs, ignition coils, water pumps, and generic engine components.",
      "Maintain clean and safe workspaces utilizing proper safety gear."
    ],
    requirements: [
      "High school diploma or vocational mechanic course completion.",
      "2+ years of hands-on experience in a professional shop environment.",
      "Strong overall knowledge of standard mechanical tools and techniques.",
      "Ability to follow repair manual steps and service procedures.",
      "Honest, reliable, and a highly collaborative team player."
    ]
  },
  {
    id: 19,
    title: "Mechanical Helper",
    category: "Technical",
    type: "Full-Time",
    location: "On-site",
    responsibilities: [
      "Assist senior mechanics with complex diagnostics and repair jobs.",
      "Organize, clean, and maintain workshop bays, tools, and heavy machinery.",
      "Perform basic service tasks like tire changes, fluid top-offs, and pre-cleaning.",
      "Retrieve parts and supplies from the warehouse for the technical team.",
      "Ensure proper disposal of shop waste, used fluids, and replaced parts."
    ],
    requirements: [
      "High school diploma or active student in automotive courses.",
      "Strong desire to learn and build a career in automotive repair.",
      "Physically fit and comfortable in a busy, noisy shop environment.",
      "Basic understanding of mechanical tools and workshop safety rules.",
      "Punctual, hardworking, and quick to follow instructions."
    ]
  }
];
