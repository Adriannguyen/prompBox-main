import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Row,
  Col,
  Alert,
  Form,
  FormGroup,
  Label,
  Input,
  Progress,
  Table
} from 'reactstrap';
import { useRealtimeMailServer, useServerHealth } from 'hooks/useRealtimeMailServer.js';

const RealtimeMailMonitor = () => {
  const {
    isConnected,
    connectionError,
    mailStats,
    reloadStatus,
    requestMailStats,
    markMailsAsRead,
    simulateNewMail,
    setServerReloadStatus
  } = useRealtimeMailServer();
  
  const { healthData, isLoading: healthLoading, error: healthError, checkHealth } = useServerHealth();
  
  const [simulateForm, setSimulateForm] = useState({
    subject: '',
    from: '',
    type: 'To'
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateResult, setSimulateResult] = useState(null);

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    
    if (!simulateForm.subject || !simulateForm.from) {
      alert('Vui lòng nhập Subject và From');
      return;
    }
    
    setIsSimulating(true);
    setSimulateResult(null);
    
    try {
      const result = await simulateNewMail(simulateForm);
      setSimulateResult({ success: true, data: result });
      
      // Reset form
      setSimulateForm({ subject: '', from: '', type: 'To' });
    } catch (error) {
      setSimulateResult({ success: false, error: error.message });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleReloadStatus = async () => {
    try {
      await setServerReloadStatus(!reloadStatus);
    } catch (error) {
      console.error('Error toggling reload status:', error);
    }
  };

  const handleManualReload = () => {
    // Trigger manual reload of mail data
    window.dispatchEvent(new CustomEvent('mailDataReload', {
      detail: { manual: true, timestamp: new Date().toISOString() }
    }));
    
    // Mark mails as read to clear reload status
    markMailsAsRead();
    
    console.log('🔄 Manual reload triggered');
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <Row className="align-items-center">
          <Col>
            <h3 className="mb-0">Real-time Mail Monitor</h3>
            <p className="text-muted mb-0">WebSocket connection to mail server</p>
          </Col>
          <Col xs="auto">
            <Badge 
              color={isConnected ? 'success' : 'danger'} 
              className="mr-2"
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
            {reloadStatus && (
              <Badge color="warning" className="mr-2">
                🔄 Reload Required
              </Badge>
            )}
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {/* Connection Status */}
        {connectionError && (
          <Alert color="danger" className="mb-3">
            <strong>Connection Error:</strong> {connectionError}
          </Alert>
        )}
        
        {/* Mail Statistics */}
        <Row className="mb-4 mail-stats-section">
          <Col md="6">
            <h4>📊 Mail Statistics</h4>
            <Table size="sm" className="mb-0">
              <tbody>
                <tr>
                  <td><strong>Total Mails:</strong></td>
                  <td><Badge color="info">{mailStats.totalMails}</Badge></td>
                </tr>
                <tr>
                  <td><strong>New Mails:</strong></td>
                  <td><Badge color={mailStats.newMails > 0 ? 'warning' : 'success'}>{mailStats.newMails}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Valid (Unreplied):</strong></td>
                  <td><Badge color="primary">{mailStats.dungHanUnreplied}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Expired (Unreplied):</strong></td>
                  <td><Badge color="danger">{mailStats.quaHanUnreplied}</Badge></td>
                </tr>
                <tr>
                  <td><strong>Last Update:</strong></td>
                  <td className="text-muted">
                    {mailStats.lastUpdate ? new Date(mailStats.lastUpdate).toLocaleString() : 'Never'}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
          
          <Col md="6">
            <div className="server-health">
              <h4>🖥️ Server Health</h4>
            {healthLoading ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Checking...</span>
              </div>
            ) : healthError ? (
              <Alert color="danger" className="mb-2">
                <small>{healthError}</small>
              </Alert>
            ) : healthData ? (
              <Table size="sm" className="mb-0">
                <tbody>
                  <tr>
                    <td><strong>Status:</strong></td>
                    <td><Badge color="success">{healthData.status}</Badge></td>
                  </tr>
                  <tr>
                    <td><strong>Uptime:</strong></td>
                    <td>{formatUptime(healthData.uptime)}</td>
                  </tr>
                  <tr>
                    <td><strong>Connected Clients:</strong></td>
                    <td><Badge color="info">{healthData.connectedClients}</Badge></td>
                  </tr>
                  <tr>
                    <td><strong>Last Check:</strong></td>
                    <td className="text-muted">
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                </tbody>
              </Table>
            ) : null}
            </div>
          </Col>
        </Row>
        
        {/* Control Actions */}
        <Row className="mb-4">
          <Col>
            <h4>🎛️ Control Actions</h4>
            <div className="control-actions">
              <Button 
                color="primary" 
                size="sm" 
                onClick={requestMailStats}
                disabled={!isConnected}
              >
                🔄 Refresh Stats
              </Button>
              
              <Button 
                color="success" 
                size="sm" 
                onClick={handleManualReload}
                disabled={!isConnected}
              >
                🔄 Manual Reload Data
              </Button>
              
              <Button 
                color="warning" 
                size="sm" 
                onClick={markMailsAsRead}
                disabled={!isConnected || !reloadStatus}
              >
                ✅ Mark as Read
              </Button>
              
              <Button 
                color={reloadStatus ? 'warning' : 'secondary'} 
                size="sm" 
                onClick={handleToggleReloadStatus}
                disabled={!isConnected}
              >
                {reloadStatus ? '🔄 Disable Reload' : '🔄 Enable Reload'}
              </Button>
              
              <Button 
                color="info" 
                size="sm" 
                onClick={checkHealth}
                disabled={healthLoading}
              >
                🏥 Check Health
              </Button>
            </div>
          </Col>
        </Row>
        
        {/* Simulate New Mail */}
        <Row>
          <Col md="12">
            <h4>📧 Simulate New Mail</h4>
            <div className="simulate-form">
              <Form onSubmit={handleSimulateSubmit}>
              <Row>
                <Col md="4">
                  <FormGroup>
                    <Label for="subject">Subject</Label>
                    <Input
                      type="text"
                      id="subject"
                      value={simulateForm.subject}
                      onChange={(e) => setSimulateForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter mail subject"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Label for="from">From</Label>
                    <Input
                      type="text"
                      id="from"
                      value={simulateForm.from}
                      onChange={(e) => setSimulateForm(prev => ({ ...prev, from: e.target.value }))}
                      placeholder="sender@example.com"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="type">Type</Label>
                    <Input
                      type="select"
                      id="type"
                      value={simulateForm.type}
                      onChange={(e) => setSimulateForm(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="To">To</option>
                      <option value="CC">CC</option>
                      <option value="BCC">BCC</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Label>&nbsp;</Label>
                    <div>
                      <Button 
                        type="submit" 
                        color="warning" 
                        disabled={!isConnected || isSimulating}
                        block
                      >
                        {isSimulating ? (
                          <>
                            <div className="spinner-border spinner-border-sm mr-2" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            Simulating...
                          </>
                        ) : (
                          '📧 Create New Mail'
                        )}
                      </Button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
            
            {simulateResult && (
              <Alert 
                color={simulateResult.success ? 'success' : 'danger'} 
                className="mt-3"
              >
                {simulateResult.success ? (
                  <>
                    <strong>✅ Success!</strong> New mail created: {simulateResult.data.fileName}
                  </>
                ) : (
                  <>
                    <strong>❌ Error:</strong> {simulateResult.error}
                  </>
                )}
              </Alert>
            )}
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default RealtimeMailMonitor;