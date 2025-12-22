#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build a Consultant AI application with:
  1. AI Research Module - vendor analysis with multi-vendor comparison
  2. AI Conference Room - multi-agent debate with 8 AI consultants
  3. Deliverables Generation - Excel and PPT files
  4. User can upload PDFs/Excel for context
  5. Professional, immersive UI

backend:
  - task: "AI Research API with vendor comparison"
    implemented: true
    working: true
    file: "/app/backend/fast_ai_research.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Fixed AI research to include vendor comparison with scoring. API returns vendor_comparison dict with scores, strengths, weaknesses for each vendor."

  - task: "Conference Room Multi-Agent Debate"
    implemented: true
    working: true
    file: "/app/backend/conference_service.py"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
      - working: false
        agent: "user"
        comment: "Conference room agents were failing with invalid model IDs"
      - working: true
        agent: "main"
        comment: "Updated agents.py with working model IDs - meta-llama/llama-3.3-70b-instruct, llama-3.3-70b-versatile (groq), etc. Tested API and all 8 agents now generate real responses."

  - task: "Excel Deliverable Generation"
    implemented: true
    working: true
    file: "/app/backend/deliverable_service.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Excel generation working. Files saved to /app/deliverables/"

  - task: "PPT Deliverable Generation"
    implemented: true
    working: true
    file: "/app/backend/deliverable_service.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "PPT uses text fallback since Gamma API key not valid. Fallback creates .txt file with presentation content."

  - task: "File Upload for Research Context"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "PDF and Excel upload endpoint extracts text and returns to frontend"

frontend:
  - task: "Research Page with Vendor Comparison Display"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Research.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Updated Research.js with complete vendor comparison UI - comparison table, vendor cards with strengths/weaknesses, recommended vendor banner"

  - task: "Consulting (Conference Room) Page"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Consulting.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Conference room page shows debate progress, agent cards, and results with consensus summary"

  - task: "Deliverables Bank Page"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Deliverables.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Deliverables page lists projects with download buttons for generated files"

  - task: "Dashboard with Mode Selection"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Dashboard.js"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Dashboard has Research Mode and Full Consulting mode cards"

metadata:
  created_by: "main_agent"
  version: "2.0"
  test_sequence: 2
  run_ui: true

test_plan:
  current_focus:
    - "AI Research API with vendor comparison"
    - "Conference Room Multi-Agent Debate"
    - "Research Page with Vendor Comparison Display"
    - "Consulting (Conference Room) Page"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      FIXES IMPLEMENTED:
      1. Updated agents.py with working OpenRouter and Groq model IDs
      2. Fixed fast_ai_research.py parsing issue (newline escape)
      3. Updated Research.js with comprehensive vendor comparison UI
      
      NEEDS TESTING:
      - Research flow: Enter problem, verify vendor comparison table appears
      - Conference room: Submit problem, verify all 8 agents respond
      - Deliverables: Generate Excel/PPT, verify download works
      
      API ENDPOINTS TO TEST:
      - POST /api/research/vendor-analysis
      - POST /api/conference/debate
      - POST /api/deliverables/excel
      - POST /api/deliverables/ppt
