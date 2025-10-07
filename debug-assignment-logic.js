// Debug chi tiết logic auto-assignment
const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING AUTO-ASSIGNMENT LOGIC\n');

// Test sender
const testSender = "a@gmail.com";
const testDomain = "gmail.com";

console.log(`📧 Testing sender: ${testSender}`);
console.log(`🌐 Domain: ${testDomain}\n`);

// Check all groups
const groupsPath = "C:\\classifyMail\\AssignmentData\\Groups";
const groupFiles = fs.readdirSync(groupsPath).filter(f => f.endsWith('.json'));

console.log(`📂 Found ${groupFiles.length} groups to check:`);

let matchingGroup = null;

for (const groupFile of groupFiles) {
    const groupPath = path.join(groupsPath, groupFile);
    const groupData = JSON.parse(fs.readFileSync(groupPath, 'utf8'));
    
    console.log(`\n🏢 Group: ${groupData.name} (${groupData.id})`);
    console.log(`   Members: ${JSON.stringify(groupData.members)}`);
    
    if (groupData.members && Array.isArray(groupData.members)) {
        for (const member of groupData.members) {
            const memberLower = member.toLowerCase().trim();
            const senderLower = testSender.toLowerCase().trim();
            
            console.log(`\n   🔍 Checking: "${memberLower}" vs "${senderLower}"`);
            
            // Check exact email match
            if (memberLower === senderLower) {
                console.log(`   ✅ EXACT MATCH FOUND!`);
                matchingGroup = groupData;
                break;
            } else {
                console.log(`   ❌ No exact match`);
            }
            
            // Check domain wildcard match (*.domain.com)
            if (memberLower.startsWith('*.') && testDomain === memberLower.substring(2)) {
                console.log(`   ✅ WILDCARD MATCH FOUND!`);
                matchingGroup = groupData;
                break;
            } else if (memberLower.startsWith('*.')) {
                console.log(`   ❌ No wildcard match: "${testDomain}" !== "${memberLower.substring(2)}"`);
            }
        }
        if (matchingGroup) break;
    } else {
        console.log(`   ⚠️  No members array found`);
    }
}

if (matchingGroup) {
    console.log(`\n🎯 MATCHING GROUP FOUND:`);
    console.log(`   Name: ${matchingGroup.name}`);
    console.log(`   ID: ${matchingGroup.id}`);
    
    // Check PICs for this group
    const picsPath = "C:\\classifyMail\\AssignmentData\\PIC";
    const picFiles = fs.readdirSync(picsPath).filter(f => f.endsWith('.json'));
    
    console.log(`\n🔍 Checking ${picFiles.length} PICs for group assignment:`);
    
    let assignedPic = null;
    
    for (const picFile of picFiles) {
        const picPath = path.join(picsPath, picFile);
        const picData = JSON.parse(fs.readFileSync(picPath, 'utf8'));
        
        console.log(`\n👤 PIC: ${picData.name} (${picData.id})`);
        console.log(`   Groups: ${JSON.stringify(picData.groups)}`);
        console.log(`   Includes matching group? ${picData.groups && picData.groups.includes(matchingGroup.id)}`);
        
        if (picData.groups && picData.groups.includes(matchingGroup.id)) {
            console.log(`   ✅ PIC ASSIGNED TO THIS GROUP!`);
            assignedPic = picData;
            break;
        }
    }
    
    if (assignedPic) {
        console.log(`\n🎉 ASSIGNMENT SHOULD WORK:`);
        console.log(`   Sender: ${testSender}`);
        console.log(`   → Group: ${matchingGroup.name} (${matchingGroup.id})`);
        console.log(`   → PIC: ${assignedPic.name} (${assignedPic.email})`);
        console.log(`\n✅ AUTO-ASSIGNMENT LOGIC IS CORRECT!`);
    } else {
        console.log(`\n❌ NO PIC ASSIGNED TO GROUP ${matchingGroup.name}`);
    }
    
} else {
    console.log(`\n❌ NO MATCHING GROUP FOUND FOR ${testSender}`);
    console.log(`   This explains why auto-assignment is not working!`);
}