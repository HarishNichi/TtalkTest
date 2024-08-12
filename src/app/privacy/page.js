"use client";

export default function Privacy() {
  // Sample privacy policy text
  const privacyText = `
    プライバシーポリシー
    1. Introduction
    Your privacy is important to us. This Privacy Policy explains how we collect, use, and disclose your personal information.

    2. Information We Collect
    We may collect personal information such as your name, email address, and phone number when you interact with our website.

    3. Use of Information
    We use the collected information to improve our services and to communicate with you.

    4. Disclosure of Information
    We do not sell or rent your personal information to third parties.

    5. Changes to Privacy Policy
    We may update this Privacy Policy from time to time.
  `;

  // Split the text by line breaks and create an array of paragraphs
  const paragraphs = privacyText.split("\n").map((paragraph, index) => (
    <p key={index} className="mb-4">
      {paragraph.trim()}
    </p>
  ));

  return (
    <>
      <main className="bg-gray-100 min-h-screen py-16">
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
          <h1 className="text-3xl font-semibold mb-4">プライバシーポリシー</h1>
          {paragraphs}
        </div>
      </main>
    </>
  );
}
