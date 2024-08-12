"use client";

export default function Terms() {
  // Sample terms and conditions text
  const termsText = `
    利用規約
    1. Introduction
    These terms and conditions govern your use of our website.

    2. Acceptable Use
    You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.

    3. Privacy Policy
    Your use of our website is also governed by our Privacy Policy.

    4. Changes to Terms
    We may revise these terms and conditions from time to time.
  `;

  // Split the text by line breaks and create an array of paragraphs
  const paragraphs = termsText.split("\n").map((paragraph, index) => (
    <p key={index} className="mb-4">
      {paragraph.trim()}
    </p>
  ));

  return (
    <main className="bg-gray-100 min-h-screen py-16">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-semibold mb-4">利用規約</h1>
        {paragraphs}
      </div>
    </main>
  );
}
