// TARS Contract Bridge - Main Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tarsContractBridge } from './tars-adapter';
import { autonomousContractManager } from './autonomous-contracts';
import { quantumTARSDelegation } from './quantum-tars';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const bridge_status = await tarsContractBridge.getBridgeStatus();
    const quantum_metrics = quantumTARSDelegation.getQuantumMetrics();
    const contract_metrics = autonomousContractManager.getContractMetrics();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      bridge_status,
      quantum_metrics,
      contract_metrics,
      endpoints: {
        tars_validate: '/api/tars/validate',
        tars_execute: '/api/tars/execute',
        autonomous_create: '/api/autonomous/create',
        autonomous_execute: '/api/autonomous/execute',
        quantum_delegate: '/api/quantum/delegate',
        quantum_execute: '/api/quantum/execute'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// TARS Contract Bridge Endpoints
app.post('/api/tars/validate', async (req, res) => {
  try {
    const { action, payload, confidence } = req.body;
    
    if (!action || !payload || confidence === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: action, payload, confidence'
      });
    }

    const validated_contract = await tarsContractBridge.validateTARSDecision(action, payload, confidence);
    
    res.json({
      success: true,
      contract: validated_contract,
      validated_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/tars/execute', async (req, res) => {
  try {
    const { contract } = req.body;
    
    if (!contract) {
      return res.status(400).json({
        error: 'Missing validated TARS contract'
      });
    }

    const execution_result = await tarsContractBridge.executeValidatedContract(contract);
    
    res.json({
      success: true,
      execution_result,
      executed_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Autonomous Contract Endpoints
app.post('/api/autonomous/create', async (req, res) => {
  try {
    const { tars_decision, autonomy_level } = req.body;
    
    if (!tars_decision) {
      return res.status(400).json({
        error: 'Missing tars_decision'
      });
    }

    const autonomous_contract = await autonomousContractManager.createAutonomousContract(
      tars_decision,
      autonomy_level
    );
    
    res.json({
      success: true,
      contract: autonomous_contract,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/autonomous/execute', async (req, res) => {
  try {
    const { contract, tars_payload } = req.body;
    
    if (!contract || !tars_payload) {
      return res.status(400).json({
        error: 'Missing contract or tars_payload'
      });
    }

    const execution_result = await autonomousContractManager.executeAutonomousContract(
      contract,
      tars_payload
    );
    
    res.json({
      success: execution_result.success,
      execution_result,
      executed_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Quantum Delegation Endpoints
app.post('/api/quantum/delegate', async (req, res) => {
  try {
    const { tars_contract, delegation_type } = req.body;
    
    if (!tars_contract) {
      return res.status(400).json({
        error: 'Missing validated TARS contract'
      });
    }

    const quantum_contract = await quantumTARSDelegation.createQuantumDelegation(
      tars_contract,
      delegation_type
    );
    
    res.json({
      success: true,
      quantum_contract,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/quantum/execute', async (req, res) => {
  try {
    const { quantum_contract, tars_payload } = req.body;
    
    if (!quantum_contract || !tars_payload) {
      return res.status(400).json({
        error: 'Missing quantum_contract or tars_payload'
      });
    }

    const quantum_result = await quantumTARSDelegation.executeQuantumDelegation(
      quantum_contract,
      tars_payload
    );
    
    res.json({
      success: quantum_result.success,
      quantum_result,
      executed_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Unified Workflow Endpoint (TARS → Autonomous → Quantum)
app.post('/api/unified/execute', async (req, res) => {
  try {
    const { action, payload, confidence, autonomy_level, enable_quantum } = req.body;
    
    console.log(`🚀 Unified workflow execution: ${action}`);
    const workflow_start = Date.now();
    const workflow_log = [];

    // Phase 1: TARS Contract Validation
    workflow_log.push("Phase 1: TARS contract validation");
    const tars_contract = await tarsContractBridge.validateTARSDecision(action, payload, confidence);
    
    // Phase 2: Autonomous Contract Creation
    workflow_log.push("Phase 2: Autonomous contract creation");
    const autonomous_contract = await autonomousContractManager.createAutonomousContract({
      action,
      confidence,
      trust_score: confidence
    }, autonomy_level || "semi_autonomous");

    // Phase 3: Quantum Delegation (if enabled and eligible)
    let quantum_result = null;
    if (enable_quantum && tars_contract.trust_metrics.quantum_delegation_ready) {
      workflow_log.push("Phase 3: Quantum delegation");
      const quantum_contract = await quantumTARSDelegation.createQuantumDelegation(tars_contract);
      quantum_result = await quantumTARSDelegation.executeQuantumDelegation(quantum_contract, payload);
    }

    // Phase 4: Autonomous Execution
    workflow_log.push("Phase 4: Autonomous execution");
    const autonomous_result = await autonomousContractManager.executeAutonomousContract(
      autonomous_contract,
      {
        ...payload,
        quantum_result: quantum_result
      }
    );

    const unified_result = {
      workflow_id: `unified_${Date.now()}`,
      execution_time_ms: Date.now() - workflow_start,
      workflow_log,
      tars_contract,
      autonomous_contract,
      autonomous_result,
      quantum_result,
      overall_success: autonomous_result.success,
      revenue_generated: autonomous_result.execution_result?.revenue_generated || 0,
      quantum_acceleration: quantum_result ? quantum_result.quantum_acceleration : null
    };

    res.json({
      success: unified_result.overall_success,
      unified_result,
      executed_at: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Metrics and Monitoring Endpoints
app.get('/api/metrics', async (req, res) => {
  try {
    const bridge_status = await tarsContractBridge.getBridgeStatus();
    const quantum_metrics = quantumTARSDelegation.getQuantumMetrics();
    const contract_metrics = autonomousContractManager.getContractMetrics();

    res.json({
      timestamp: new Date().toISOString(),
      bridge_status,
      quantum_metrics,
      contract_metrics,
      system_health: {
        uptime_ms: process.uptime() * 1000,
        memory_usage: process.memoryUsage(),
        active_connections: req.socket.server._connections || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/quantum/status', (req, res) => {
  try {
    const active_delegations = quantumTARSDelegation.getActiveQuantumDelegations();
    const quantum_queue = quantumTARSDelegation.getQuantumQueue();
    const performance_history = quantumTARSDelegation.getPerformanceHistory().slice(-10); // Last 10

    res.json({
      active_delegations: Array.from(active_delegations.entries()),
      quantum_queue: Array.from(quantum_queue.entries()),
      performance_history,
      rtx_5090_endpoint: process.env.RTX_5090_ENDPOINT,
      quantum_enabled: process.env.QUANTUM_DELEGATION === "enabled",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/autonomous/history', (req, res) => {
  try {
    const execution_history = autonomousContractManager.getExecutionHistory().slice(-20); // Last 20
    const compound_patterns = Array.from(autonomousContractManager.getCompoundPatterns().entries());
    const contract_metrics = autonomousContractManager.getContractMetrics();

    res.json({
      execution_history,
      compound_patterns,
      contract_metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('TARS Contract Bridge Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || 'unknown'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🔥 TARS Contract Bridge running on port ${port}`);
  console.log(`🎯 Contract validation: ${process.env.CONTRACT_VALIDATION || 'strict'}`);
  console.log(`⚡ Quantum delegation: ${process.env.QUANTUM_DELEGATION || 'disabled'}`);
  console.log(`🚀 RTX 5090 endpoint: ${process.env.RTX_5090_ENDPOINT || 'not configured'}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

export { app };