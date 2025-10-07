// Debug matching logic
const testSender = "duongtest@gmail.com";
const marketingMembers = [
    "marketing@company.com",
    "a@gmail.com",
    "b@gmail.com", 
    "huan.tran@samsung.com"
];

console.log(`🔍 Testing sender: ${testSender}`);
console.log(`📋 Marketing Team members:`);
marketingMembers.forEach(member => console.log(`  - ${member}`));

const senderEmail = testSender;
const senderDomain = senderEmail.includes('@') ? senderEmail.split('@')[1]?.toLowerCase() : null;

console.log(`\n🌐 Sender domain: ${senderDomain}\n`);

let matchFound = false;

for (const member of marketingMembers) {
    const memberLower = member.toLowerCase().trim();
    const senderLower = senderEmail.toLowerCase().trim();
    
    console.log(`\n🔍 Checking: "${memberLower}" vs "${senderLower}"`);

    // Check exact email match
    if (memberLower === senderLower) {
        console.log(`✅ EXACT MATCH: ${senderEmail} === ${member}`);
        matchFound = true;
        break;
    } else {
        console.log(`❌ Not exact match: "${memberLower}" !== "${senderLower}"`);
    }

    // Check domain wildcard match (*.domain.com)  
    if (memberLower.startsWith('*.') && senderDomain === memberLower.substring(2)) {
        console.log(`✅ WILDCARD MATCH: ${senderEmail} matches ${member}`);
        matchFound = true;
        break;
    } else if (memberLower.startsWith('*.')) {
        console.log(`❌ Not wildcard match: domain "${senderDomain}" !== "${memberLower.substring(2)}"`);
    } else {
        console.log(`❌ Not wildcard: "${memberLower}" doesn't start with "*."`);
    }
    
    // Show old problematic logic result for comparison
    if (memberLower.includes(senderDomain)) {
        console.log(`⚠️  OLD LOGIC would match: "${memberLower}" contains "${senderDomain}"`);
    }
}

console.log(`\n📊 Result: ${matchFound ? "✅ MATCH FOUND" : "❌ NO MATCH"} for ${testSender}`);