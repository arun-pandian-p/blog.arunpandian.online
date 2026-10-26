package com.arunpandian.blog.service;

import com.arunpandian.blog.entity.SiteSetting;
import com.arunpandian.blog.repository.SiteSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SiteSettingService {

    private final SiteSettingRepository settingRepository;

    public SiteSettingService(SiteSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, String> getAllSettings() {
        List<SiteSetting> list = settingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (SiteSetting s : list) {
            map.put(s.getKey(), s.getValue());
        }
        return map;
    }

    @Transactional(readOnly = true)
    public String getSetting(String key, String defaultValue) {
        return settingRepository.findByKey(key)
                .map(SiteSetting::getValue)
                .orElse(defaultValue);
    }

    @Transactional
    public SiteSetting setSetting(String key, String value) {
        SiteSetting setting = settingRepository.findByKey(key)
                .orElse(new SiteSetting(key, value));
        setting.setValue(value);
        return settingRepository.save(setting);
    }
}
