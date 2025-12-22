import requests
import sys
import json
from datetime import datetime
import time

class ConsultantAITester:
    def __init__(self, base_url="https://insightlab-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error text: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_agents_endpoint(self):
        """Test agents endpoint"""
        success, response = self.run_test("Get Agents", "GET", "agents", 200)
        if success and isinstance(response, list) and len(response) >= 8:
            print(f"   Found {len(response)} agents")
            for agent in response[:3]:  # Show first 3 agents
                print(f"   - {agent.get('name', 'Unknown')}: {agent.get('role', 'Unknown role')}")
        return success

    def test_create_project(self):
        """Test project creation"""
        project_data = {
            "title": "Test ERP Analysis Project",
            "problem_statement": "We need to evaluate ERP solutions for our manufacturing company to improve operational efficiency and reduce costs.",
            "project_type": "research"
        }
        
        success, response = self.run_test(
            "Create Project", 
            "POST", 
            "projects", 
            200, 
            project_data
        )
        
        if success and 'id' in response:
            self.project_id = response['id']
            print(f"   Project ID: {self.project_id}")
        
        return success

    def test_get_projects(self):
        """Test getting all projects"""
        return self.run_test("Get Projects", "GET", "projects", 200)

    def test_get_project_by_id(self):
        """Test getting specific project"""
        if not self.project_id:
            print("❌ Skipped - No project ID available")
            return False
        
        return self.run_test(
            "Get Project by ID", 
            "GET", 
            f"projects/{self.project_id}", 
            200
        )

    def test_research_vendor_analysis(self):
        """Test vendor analysis research"""
        if not self.project_id:
            print("❌ Skipped - No project ID available")
            return False
        
        research_data = {
            "project_id": self.project_id,
            "problem": "We need to evaluate ERP solutions for our manufacturing company",
            "vendor_name": "SAP",
            "industry": "Manufacturing"
        }
        
        success, response = self.run_test(
            "Research Vendor Analysis", 
            "POST", 
            "research/vendor-analysis", 
            200, 
            research_data,
            timeout=60  # Longer timeout for AI processing
        )
        
        if success:
            expected_keys = ['vendor_name', 'industry', 'analysis', 'recommendations']
            for key in expected_keys:
                if key in response:
                    print(f"   ✓ Has {key}")
                else:
                    print(f"   ⚠ Missing {key}")
        
        return success

    def test_research_search(self):
        """Test research search functionality"""
        if not self.project_id:
            print("❌ Skipped - No project ID available")
            return False
        
        search_data = {
            "project_id": self.project_id,
            "query": "ERP market trends 2024"
        }
        
        return self.run_test(
            "Research Search", 
            "POST", 
            "research/search", 
            200, 
            search_data
        )

    def test_conference_debate(self):
        """Test conference room debate"""
        if not self.project_id:
            print("❌ Skipped - No project ID available")
            return False
        
        debate_data = {
            "project_id": self.project_id,
            "problem": "Should we implement SAP or Oracle for our ERP transformation?"
        }
        
        success, response = self.run_test(
            "Conference Debate", 
            "POST", 
            "conference/debate", 
            200, 
            debate_data,
            timeout=120  # Longer timeout for multi-agent processing
        )
        
        if success:
            expected_keys = ['debate_history', 'consensus', 'total_rounds']
            for key in expected_keys:
                if key in response:
                    print(f"   ✓ Has {key}")
                    if key == 'debate_history' and isinstance(response[key], list):
                        print(f"     - {len(response[key])} debate entries")
                else:
                    print(f"   ⚠ Missing {key}")
        
        return success

    def test_excel_deliverable(self):
        """Test Excel deliverable generation"""
        if not self.project_id:
            print("❌ Skipped - No project ID available")
            return False
        
        deliverable_data = {
            "project_id": self.project_id,
            "deliverable_type": "current_state",
            "content": {
                "problem": "ERP evaluation for manufacturing",
                "findings": [
                    "Current system lacks integration",
                    "Manual processes cause delays",
                    "Data silos impact decision making"
                ]
            }
        }
        
        success, response = self.run_test(
            "Generate Excel Deliverable", 
            "POST", 
            "deliverables/excel", 
            200, 
            deliverable_data
        )
        
        if success and 'filename' in response:
            print(f"   Generated file: {response['filename']}")
        
        return success

    def test_ppt_deliverable(self):
        """Test PPT deliverable generation via Gamma"""
        if not self.project_id:
            print("❌ Skipped - No project ID available")
            return False
        
        ppt_data = {
            "project_id": self.project_id,
            "deliverable_type": "presentation",
            "content": {
                "title": "ERP Analysis Results",
                "text": "Problem: ERP evaluation for manufacturing\n\nRecommendation: Implement SAP S/4HANA\n\nNext Steps:\n1. Conduct pilot\n2. Plan rollout\n3. Train users"
            }
        }
        
        success, response = self.run_test(
            "Generate PPT Deliverable", 
            "POST", 
            "deliverables/ppt", 
            200, 
            ppt_data,
            timeout=60
        )
        
        if success:
            if response.get('success'):
                print(f"   ✓ PPT generated successfully")
                if 'presentation_url' in response:
                    print(f"   URL: {response['presentation_url']}")
            else:
                print(f"   ⚠ PPT generation failed: {response.get('error', 'Unknown error')}")
        
        return success

def main():
    print("🚀 Starting Consultant AI Backend Testing")
    print("=" * 50)
    
    tester = ConsultantAITester()
    
    # Test sequence
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("Agents", tester.test_agents_endpoint),
        ("Create Project", tester.test_create_project),
        ("Get Projects", tester.test_get_projects),
        ("Get Project by ID", tester.test_get_project_by_id),
        ("Research Vendor Analysis", tester.test_research_vendor_analysis),
        ("Research Search", tester.test_research_search),
        ("Conference Debate", tester.test_conference_debate),
        ("Excel Deliverable", tester.test_excel_deliverable),
        ("PPT Deliverable", tester.test_ppt_deliverable),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
        
        # Small delay between tests
        time.sleep(1)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend is functioning well!")
        return 0
    elif success_rate >= 60:
        print("⚠️  Backend has some issues but core functionality works")
        return 1
    else:
        print("❌ Backend has significant issues")
        return 2

if __name__ == "__main__":
    sys.exit(main())