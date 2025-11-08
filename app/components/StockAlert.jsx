/**
 * Stock Alert Component
 * Displays inventory alerts and warnings for low stock and out of stock items
 * 
 * Usage:
 * <StockAlert 
 *   alerts={alertsArray}
 *   onDismiss={(alertId) => handleDismiss(alertId)}
 *   onRestock={(productId) => handleRestock(productId)}
 * />
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const StockAlert = ({ 
  alerts = [], 
  onDismiss = null,
  onRestock = null,
  showActions = true,
  maxVisible = 3
}) => {
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type, severity) => {
    if (type === 'out_of_stock') return 'times-circle';
    if (type === 'low_stock') return 'exclamation-triangle';
    return 'info-circle';
  };

  const getAlertColors = (type, severity) => {
    if (type === 'out_of_stock' || severity === 'critical') {
      return {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        iconColor: '#dc2626',
        textColor: '#991b1b'
      };
    } else if (type === 'low_stock' || severity === 'warning') {
      return {
        backgroundColor: '#fffbeb',
        borderColor: '#fed7aa',
        iconColor: '#d97706',
        textColor: '#92400e'
      };
    }
    return {
      backgroundColor: '#eff6ff',
      borderColor: '#bfdbfe',
      iconColor: '#2563eb',
      textColor: '#1d4ed8'
    };
  };

  const AlertItem = ({ alert, isExpanded, onToggle }) => {
    const colors = getAlertColors(alert.type, alert.severity);
    const icon = getAlertIcon(alert.type, alert.severity);

    return (
      <View style={[styles.alertItem, { 
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor 
      }]}>
        <TouchableOpacity 
          style={styles.alertHeader}
          onPress={() => onToggle(alert.id)}
          activeOpacity={0.7}
        >
          <FontAwesome5 
            name={icon} 
            size={16} 
            color={colors.iconColor}
            style={styles.alertIcon}
          />
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: colors.textColor }]}>
              {alert.type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock Alert'}
            </Text>
            <Text style={[styles.alertMessage, { color: colors.textColor }]}>
              {alert.message}
            </Text>
          </View>
          <FontAwesome5 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={12} 
            color={colors.iconColor}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.alertDetails}>
            <View style={styles.alertStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current Stock:</Text>
                <Text style={[styles.statValue, { color: colors.textColor }]}>
                  {alert.currentQuantity || 0}
                </Text>
              </View>
              {alert.threshold && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Threshold:</Text>
                  <Text style={styles.statValue}>{alert.threshold}</Text>
                </View>
              )}
            </View>

            {showActions && (
              <View style={styles.alertActions}>
                {onRestock && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.restockButton]}
                    onPress={() => onRestock(alert.productId)}
                  >
                    <FontAwesome5 name="plus" size={12} color="white" />
                    <Text style={styles.restockButtonText}>Restock</Text>
                  </TouchableOpacity>
                )}
                {onDismiss && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.dismissButton]}
                    onPress={() => onDismiss(alert.id)}
                  >
                    <FontAwesome5 name="times" size={12} color="#6b7280" />
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const visibleAlerts = alerts.slice(0, maxVisible);
  const hiddenCount = alerts.length - maxVisible;

  return (
    <View style={styles.container}>
      {visibleAlerts.map((alert, index) => (
        <AlertItem
          key={alert.id || index}
          alert={alert}
          isExpanded={expandedAlert === (alert.id || index)}
          onToggle={(id) => setExpandedAlert(expandedAlert === id ? null : id)}
        />
      ))}

      {hiddenCount > 0 && (
        <TouchableOpacity 
          style={styles.showMoreButton}
          onPress={() => setShowAllModal(true)}
        >
          <Text style={styles.showMoreText}>
            View {hiddenCount} more alert{hiddenCount > 1 ? 's' : ''}
          </Text>
          <FontAwesome5 name="chevron-right" size={12} color="#2563eb" />
        </TouchableOpacity>
      )}

      {/* Show All Modal */}
      <Modal
        visible={showAllModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Stock Alerts</Text>
            <TouchableOpacity 
              onPress={() => setShowAllModal(false)}
              style={styles.modalCloseButton}
            >
              <FontAwesome5 name="times" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {alerts.map((alert, index) => (
              <AlertItem
                key={alert.id || index}
                alert={alert}
                isExpanded={expandedAlert === (alert.id || index)}
                onToggle={(id) => setExpandedAlert(expandedAlert === id ? null : id)}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  alertItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    opacity: 0.8,
  },
  alertDetails: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  alertStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 8,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  alertActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  restockButton: {
    backgroundColor: '#059669',
  },
  restockButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dismissButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 8,
  },
  showMoreText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
});

export default StockAlert;