import {ServiceBase} from './servicebase';
import {ApiConstants, ControllerConstants} from '../model/Common/constants';
import { Injectable } from '@angular/core';
import {SessionData} from '../model/Common/sessionData';

@Injectable({
  providedIn: 'root'
})

export class RulesService
{
  constructor(private base:ServiceBase, private session:SessionData){}

      getAllRulesetsByImplementationCompany() 
      {
        return this.base.getData(ControllerConstants.RULES, ApiConstants.GET_RULESETS_BY_IMPL_COMP,"1");
      } 

      getAllRulesets() 
      {
        return this.base.getData(ControllerConstants.RULES, ApiConstants.GET_ALL_RULESETS);
      } 
      
      UpsertRuleSet(ruleSet)
      {
        return this.base.putData(ControllerConstants.RULES, ApiConstants.UPSERT_RULESET,ruleSet);
      }

      deleteRuleSet(ruleSetId)
      {
        return this.base.putData(ControllerConstants.RULES, ApiConstants.DELETE_RULESET,ruleSetId);
      }

      upsertRule(rule)
      {
        return this.base.putData(ControllerConstants.RULES, ApiConstants.UPSERT_RULE,rule);
      }

      getRulesByRuleSetId(ruleSetId)
      {
        return this.base.getData(ControllerConstants.RULES, ApiConstants.GET_RULES_BY_RULESET_ID,ruleSetId);
      }

      getRulesetwithRules(ruleSetId)
      {
        return this.base.getData(ControllerConstants.RULES, ApiConstants.GET_RULESET_BY_RULESET_ID,ruleSetId);
      }

      getRulesetwithRulesbyname(name)
      {
        return this.base.getData(ControllerConstants.RULES, ApiConstants.GET_RULESET_BY_RULESET_ID,name);
      }

      updateRulesPriority(data)
      {
        return this.base.postData(ControllerConstants.RULES, ApiConstants.UPDATE_RULES_PRIORITY, data);
      }

}