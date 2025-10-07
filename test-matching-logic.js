// Test auto-assign logic fix
const testSender = "duongtest@gmail.com";
const testMembers = [
    "uts.22518983@gmail.com",
    "jessica.cohen@unity3d.com", 
    "new.member@test.com",
    "duongg@gmail.com",
    "test@example.com",
    "*.gmail.com"  // This should match
];

console.log(`Testing sender: ${testSender}`);
console.log("Against members:");
testMembers.forEach(member => console.log(`  - ${member}`));

const senderEmail = testSender;
const senderDomain = senderEmail.includes('@') ? senderEmail.split('@')[1]?.toLowerCase() : null;

console.log(`\nSender domain: ${senderDomain}\n`);

let matchFound = false;

for (const member of testMembers) {
    const memberLower = member.toLowerCase().trim();
    const senderLower = senderEmail.toLowerCase().trim();

    // Check exact email match
    if (memberLower === senderLower) {
        console.log(`✅ EXACT MATCH: ${senderEmail} === ${member}`);
        matchFound = true;
        break;
    }

    // Check domain wildcard match (*.domain.com)  
    if (memberLower.startsWith('*.') && senderDomain === memberLower.substring(2)) {
        console.log(`✅ WILDCARD MATCH: ${senderEmail} matches ${member}`);
        matchFound = true;
        break;
    }

    // Old logic that was causing false matches:
    // if (memberLower.includes(senderDomain)) {
    //     console.log(`❌ FALSE MATCH (old logic): ${member} contains ${senderDomain}`);
    // }

    console.log(`❌ NO MATCH: ${member} vs ${senderEmail}`);
}

if (!matchFound) {
    console.log(`\n❌ NO VALID MATCH FOUND for ${testSender}`);
} else {
    console.log(`\n✅ VALID MATCH FOUND for ${testSender}`);
}