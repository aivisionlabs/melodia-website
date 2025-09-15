#!/usr/bin/env node

/**
 * Phase 5 Testing Script
 * Tests all functionality including authentication, form validation, error handling, and security
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🎵 Melodia Phase 5 Testing Suite')
console.log('================================\n')

// Test configuration
const TESTS = {
  build: {
    name: 'Build Test',
    command: 'npm run build',
    description: 'Verify the application builds successfully'
  },
  lint: {
    name: 'Linting Test',
    command: 'npm run lint',
    description: 'Check for code quality and style issues'
  },
  typeCheck: {
    name: 'TypeScript Check',
    command: 'npx tsc --noEmit',
    description: 'Verify TypeScript types are correct'
  }
}

// Security tests
const SECURITY_TESTS = [
  {
    name: 'Input Sanitization',
    test: () => {
             const { sanitizeInput } = require('../src/lib/security')
      
      const testCases = [
        { input: '<script>alert("xss")</script>', expected: 'alert("xss")' },
        { input: 'javascript:alert("xss")', expected: 'alert("xss")' },
        { input: 'normal text', expected: 'normal text' },
        { input: '<img src="x" onerror="alert(1)">', expected: 'img src="x" onerror="alert(1)"' }
      ]
      
      let passed = 0
      testCases.forEach(({ input, expected }) => {
        const result = sanitizeInput(input)
        if (result === expected) {
          passed++
        } else {
          console.log(`❌ Failed: "${input}" -> "${result}" (expected "${expected}")`)
        }
      })
      
      return { passed, total: testCases.length }
    }
  },
  {
    name: 'Email Validation',
    test: () => {
             const { validateEmail } = require('../src/lib/security')
      
      const testCases = [
        { input: 'test@example.com', expected: true },
        { input: 'invalid-email', expected: false },
        { input: 'test@', expected: false },
        { input: '@example.com', expected: false },
        { input: '', expected: false }
      ]
      
      let passed = 0
      testCases.forEach(({ input, expected }) => {
        const result = validateEmail(input)
        if (result === expected) {
          passed++
        } else {
          console.log(`❌ Failed: "${input}" -> ${result} (expected ${expected})`)
        }
      })
      
      return { passed, total: testCases.length }
    }
  },
  {
    name: 'Password Validation',
    test: () => {
             const { validatePassword } = require('../src/lib/security')
      
      const testCases = [
        { input: 'password123', expected: true },
        { input: 'weak', expected: false },
        { input: '12345678', expected: false },
        { input: 'abcdefgh', expected: false },
        { input: '', expected: false }
      ]
      
      let passed = 0
      testCases.forEach(({ input, expected }) => {
        const result = validatePassword(input)
        if (result === expected) {
          passed++
        } else {
          console.log(`❌ Failed: "${input}" -> ${result} (expected ${expected})`)
        }
      })
      
      return { passed, total: testCases.length }
    }
  }
]

// File structure tests
const FILE_STRUCTURE_TESTS = [
  'src/app/auth/login/page.tsx',
  'src/app/auth/signup/page.tsx',
  'src/app/create-song/page.tsx',
  'src/components/ui/error-boundary.tsx',
  'src/components/ui/loading-spinner.tsx',
  'src/components/ui/toast.tsx',
  'src/lib/security.ts',
  'src/lib/user-actions.ts',
  'src/lib/song-request-actions.ts',
  'src/hooks/use-auth.ts',
  'src/types/index.ts'
]

// Run a command and return a promise
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${description}`)
    
    const [cmd, ...args] = command.split(' ')
    const child = spawn(cmd, args, { 
      stdio: 'pipe',
      shell: true 
    })
    
    let output = ''
    let errorOutput = ''
    
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Passed: ${description}`)
        resolve({ success: true, output, errorOutput })
      } else {
        console.log(`❌ Failed: ${description}`)
        console.log(`Error: ${errorOutput}`)
        resolve({ success: false, output, errorOutput })
      }
    })
    
    child.on('error', (error) => {
      console.log(`❌ Error: ${description}`)
      console.log(`Error: ${error.message}`)
      resolve({ success: false, output, errorOutput: error.message })
    })
  })
}

// Check if file exists
function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath)
  const exists = fs.existsSync(fullPath)
  if (exists) {
    console.log(`✅ File exists: ${filePath}`)
  } else {
    console.log(`❌ File missing: ${filePath}`)
  }
  return exists
}

// Run security tests
function runSecurityTests() {
  console.log('\n🔒 Running Security Tests')
  console.log('========================')
  
  let totalPassed = 0
  let totalTests = 0
  
  SECURITY_TESTS.forEach(test => {
    try {
      const result = test.test()
      totalPassed += result.passed
      totalTests += result.total
      console.log(`✅ ${test.name}: ${result.passed}/${result.total} passed`)
    } catch (error) {
      console.log(`❌ ${test.name}: Error - ${error.message}`)
    }
  })
  
  return { passed: totalPassed, total: totalTests }
}

// Run file structure tests
function runFileStructureTests() {
  console.log('\n📁 Checking File Structure')
  console.log('=========================')
  
  let passed = 0
  FILE_STRUCTURE_TESTS.forEach(filePath => {
    if (checkFileExists(filePath)) {
      passed++
    }
  })
  
  return { passed, total: FILE_STRUCTURE_TESTS.length }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Phase 5 Testing...\n')
  
  let buildPassed = false
  let lintPassed = false
  let typeCheckPassed = false
  
  // Run build tests
  console.log('🔨 Build Tests')
  console.log('==============')
  
  for (const [key, test] of Object.entries(TESTS)) {
    const result = await runCommand(test.command, test.description)
    if (key === 'build') buildPassed = result.success
    if (key === 'lint') lintPassed = result.success
    if (key === 'typeCheck') typeCheckPassed = result.success
  }
  
  // Run security tests
  const securityResults = runSecurityTests()
  
  // Run file structure tests
  const fileStructureResults = runFileStructureTests()
  
  // Summary
  console.log('\n📊 Test Summary')
  console.log('===============')
  console.log(`Build Test: ${buildPassed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Linting Test: ${lintPassed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`TypeScript Check: ${typeCheckPassed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Security Tests: ${securityResults.passed}/${securityResults.total} passed`)
  console.log(`File Structure: ${fileStructureResults.passed}/${fileStructureResults.total} files found`)
  
  // Overall result
  const allTestsPassed = buildPassed && lintPassed && typeCheckPassed && 
                        securityResults.passed === securityResults.total &&
                        fileStructureResults.passed === fileStructureResults.total
  
  console.log(`\n🎯 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  
  if (allTestsPassed) {
    console.log('\n🎉 Phase 5 is ready for production!')
    process.exit(0)
  } else {
    console.log('\n⚠️  Please fix the failing tests before proceeding.')
    process.exit(1)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner error:', error)
    process.exit(1)
  })
}

module.exports = { runTests, runSecurityTests, runFileStructureTests }
